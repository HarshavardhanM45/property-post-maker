import { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, RefreshCcw, Image as ImageIcon, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import PropertyPreview from './components/PropertyPreview';
import PropertyForm from './components/PropertyForm';

// Initial state is just empty strings for everything 
// (We only show default values if requested, but for a clean app state it can start empty, 
// wait, the prompt says "Reset state must have empty input boxes. Do not restore the example/default property values.")
// But the prompt initially said "Pre-populate the form with 4 BHK Luxury Villa...". So first load should have them, 
// reset should clear them.
const INITIAL_DATA = {
  propertyType: '4 BHK Luxury Villa',
  location: 'Sushant Golf City, Lucknow',
  price: '₹2.5 Cr onwards',
  highlights: '3000 sq.ft · Corner plot · Ready to move'
};

const EMPTY_DATA = {
  propertyType: '',
  location: '',
  price: '',
  highlights: ''
};

function App() {
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  
  // AI Generation States
  const [aiImage, setAiImage] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('idle'); // 'idle' | 'designing' | 'generating' | 'success' | 'error'
  const [aiError, setAiError] = useState(null);

  const previewRef = useRef(null);

  const handleReset = () => {
    setFormData(EMPTY_DATA);
    setAiImage(null);
    setGenerationStatus('idle');
    setAiError(null);
  };

  const handleGenerateAiImage = async () => {
    if (!isValid) return;
    
    setGenerationStatus('designing');
    setAiError(null);
    setAiImage(null);

    try {
      // Small artificial delay for UX to show the first step
      await new Promise(r => setTimeout(r, 800));
      
      setGenerationStatus('generating');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/generate-property-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('AI image generation is temporarily unavailable. You can continue using the property post with the default image.');
      }

      const data = await response.json();
      
      if (data.success && data.image) {
        setAiImage(data.image);
        setGenerationStatus('success');
      } else {
        throw new Error(data.error || 'Failed to retrieve image from AI provider.');
      }
    } catch (err) {
      console.error(err);
      setGenerationStatus('error');
      setAiError('AI image generation is temporarily unavailable. You can continue using the property post with the default image.');
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    setIsGeneratingPng(true);
    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        canvasWidth: 1080,
        canvasHeight: 1350,
        fetchRequest: {
          cache: 'no-cache'
        }
      });
      
      const link = document.createElement('a');
      link.download = `property-post-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate PNG. Please try again.');
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const isValid = formData.propertyType.trim() && formData.location.trim() && formData.price.trim() && formData.highlights.trim();

  // Determine which image to show
  let displayImage = null;
  if (aiImage) {
    displayImage = aiImage;
  } else if (generationStatus === 'error') {
    displayImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                PROPERTY POST MAKER
              </h1>
              <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                Real Estate Creative Studio
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-sm font-medium text-slate-500">
            Built by <span className="text-slate-900 font-semibold">Harshavardhan M</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* LEFT PANEL: FORM (40%) */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Create Your Post</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Enter your property details below. The preview will update instantly.
              </p>
            </div>
            
            <PropertyForm formData={formData} setFormData={setFormData} />

            {/* AI Generation Button */}
            <div className="mt-8 mb-4">
              <button
                onClick={handleGenerateAiImage}
                disabled={!isValid || generationStatus === 'designing' || generationStatus === 'generating'}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {generationStatus === 'designing' ? (
                  <><Loader2 className="animate-spin w-5 h-5" /> Designing your property...</>
                ) : generationStatus === 'generating' ? (
                  <><Loader2 className="animate-spin w-5 h-5" /> Generating architectural preview...</>
                ) : generationStatus === 'success' ? (
                  <><Sparkles className="w-5 h-5" /> Regenerate AI Property Image</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate AI Property Image</>
                )}
              </button>
              
              {/* Error Message */}
              {generationStatus === 'error' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{aiError}</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleDownload}
                disabled={!isValid || isGeneratingPng}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isGeneratingPng ? (
                  <>
                    <RefreshCcw className="animate-spin w-5 h-5" /> 
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> 
                    <span>Download PNG</span>
                  </>
                )}
              </button>
              <button 
                onClick={handleReset}
                className="sm:w-auto w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium py-3.5 px-6 rounded-xl transition-all"
              >
                <RefreshCcw className="w-5 h-5" /> 
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">Live Preview</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-200 px-2.5 py-1 rounded-md">1080 × 1350 px</span>
          </div>
          
          <div className="bg-slate-200/50 rounded-3xl p-4 sm:p-10 flex items-center justify-center min-h-[600px] border border-slate-200 shadow-inner overflow-hidden relative">
            <div className="relative w-full max-w-[540px] aspect-[4/5] flex items-center justify-center">
              <div className="absolute origin-center">
                <div className="scale-[0.3] sm:scale-[0.4] md:scale-[0.5] lg:scale-[0.45] xl:scale-[0.55] 2xl:scale-[0.6] origin-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300">
                  <div 
                    ref={previewRef}
                    className="w-[1080px] h-[1350px] bg-white shadow-2xl flex flex-col relative overflow-hidden shrink-0"
                  >
                    <PropertyPreview formData={formData} displayImage={displayImage} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
