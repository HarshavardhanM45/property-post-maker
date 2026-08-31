import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-property-image', async (req, res) => {
  console.log('\n--- NEW REQUEST ---');
  
  const groqPresent = !!process.env.GROQ_API_KEY;
  const hfPresent = !!process.env.HF_TOKEN;
  
  console.log(`GROQ_API_KEY present: ${groqPresent}`);
  console.log(`HF_TOKEN present: ${hfPresent}`);

  try {
    const { propertyType, location, price, highlights } = req.body;

    if (!propertyType || !location || !price || !highlights) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required property details.' 
      });
    }

    if (!groqPresent) {
      return res.status(500).json({ 
        success: false, 
        error: 'Groq configuration missing', 
        details: 'GROQ_API_KEY is not set in environment variables.' 
      });
    }

    // 1. Generate detailed prompt using Groq
    console.log('Groq request started');
    const groqSystemPrompt = `You are an expert architectural prompt engineer. Your job is to take basic property details and generate a highly detailed image generation prompt.
Do NOT claim that the generated image represents an actual property at the supplied location. Use the location for inspiration only.
Output ONLY the raw prompt text, no intro or outro.

Use this general structure but adapt it intelligently based on the inputs:
Photorealistic architectural visualization of a [BHK/PROPERTY TYPE] in [CITY/REGION], India.
Designed for a [BUDGET] property.
Architecture: [architecture description]
Exterior: [materials, facade, windows, doors, balconies]
Landscape: [garden, driveway, trees, landscaping]
Setting: [general urban/suburban setting appropriate to location]
Lighting: [premium daylight / golden hour depending on design]
Camera: professional architectural photography, wide-angle exterior view, eye-level or slightly elevated perspective, high dynamic range, realistic proportions, photorealistic materials, high-end real estate photography.
No people. No text. No logos. No watermark. No readable signage. No fantasy architecture. No distorted windows or doors. No floating objects. No duplicate buildings. No unrealistic proportions.`;

    const groqUserMessage = `Property: ${propertyType}\nLocation: ${location}\nPrice: ${price}\nHighlights: ${highlights}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-27b', 
        messages: [
          { role: 'system', content: groqSystemPrompt },
          { role: 'user', content: groqUserMessage }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    console.log(`Groq response status: ${groqResponse.status}`);

    if (!groqResponse.ok) {
      const errTxt = await groqResponse.text();
      console.log(`Groq error response: ${errTxt}`);
      return res.status(500).json({
        success: false,
        error: 'Groq prompt generation failed',
        details: `HTTP ${groqResponse.status}: ${errTxt}`
      });
    }

    const groqData = await groqResponse.json();
    let generatedPrompt = groqData.choices[0].message.content.trim();
    generatedPrompt = generatedPrompt.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    console.log(`Generated image prompt: \n${generatedPrompt}\n`);

    // 2. Generate Image using Hugging Face
    console.log('Hugging Face request started');
    let base64Data = null;
    let mimeType = 'image/jpeg';
    
    if (hfPresent) {
      try {
        const client = new InferenceClient(process.env.HF_TOKEN);
        const imageBlob = await client.textToImage({
          model: "black-forest-labs/FLUX.1-schnell",
          inputs: generatedPrompt,
        });
        
        console.log('Hugging Face request succeeded.');
        const arrayBuffer = await imageBlob.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString('base64');
        mimeType = imageBlob.type || 'image/jpeg';
      } catch (hfError) {
        console.log(`Hugging Face error: ${hfError.message}`);
        console.log('Falling back to Pollinations.ai due to HF failure (e.g. depleted credits).');
      }
    } else {
      console.log('HF_TOKEN not present, defaulting to Pollinations.ai fallback.');
    }

    // 3. Fallback to Pollinations API if HF failed or token missing
    if (!base64Data) {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedPrompt)}?width=1080&height=1350&nologo=true`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        throw new Error('Fallback image provider also failed.');
      }
      const arrayBuffer = await fallbackResponse.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
    }

    const imageUrl = `data:${mimeType};base64,${base64Data}`;
    console.log('Successfully prepared image for frontend.');
    
    res.json({ 
      success: true, 
      image: imageUrl, 
      prompt: generatedPrompt 
    });

  } catch (error) {
    console.log(`Final error: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: 'An unexpected backend error occurred',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
