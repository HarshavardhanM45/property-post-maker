import { MapPin, Phone, User, CheckCircle2, Image as ImageIcon } from 'lucide-react';

function PropertyPreview({ formData, displayImage }) {
  // Parse highlights into an array
  const highlightsList = formData.highlights 
    ? formData.highlights.split(/·|,|-/).map(h => h.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full h-full bg-[#fcfcfc] relative flex flex-col font-sans text-slate-900 border-[12px] border-white box-border shadow-2xl">
      
      {/* Top Header */}
      <div className="px-10 py-8 flex justify-between items-center bg-white z-10 border-b border-slate-100">
        <div className="flex flex-col">
          <span className="font-bold text-3xl tracking-widest uppercase text-slate-900">
            Harshavardhan
          </span>
          <span className="font-light text-2xl tracking-[0.2em] uppercase text-slate-500">
            Realty
          </span>
        </div>
        <div className="bg-slate-900 text-white px-5 py-2.5 rounded-sm font-semibold text-sm uppercase tracking-widest shadow-sm">
          Exclusive Listing
        </div>
      </div>

      {/* Main Image Area */}
      <div className="w-full h-[600px] relative shrink-0 bg-slate-900 flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <>
            <img 
              src={displayImage} 
              alt="Property" 
              className="w-full h-full object-cover"
              crossOrigin="anonymous" 
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 z-10">
            <ImageIcon className="w-24 h-24 mb-6 opacity-30" />
            <span className="text-3xl font-light tracking-wide text-slate-300">Your AI property image will appear here</span>
          </div>
        )}
        
        {/* Overlay Price (Always visible) */}
        <div className="absolute bottom-8 right-10 z-20">
          <div className="bg-white/95 backdrop-blur-md px-8 py-4 rounded-xl shadow-xl border border-white/20">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Asking Price</p>
            <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {formData.price || 'Price on Request'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-12 py-10 flex flex-col">
        
        <div className="mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tight text-slate-900 mb-4 leading-none">
            {formData.propertyType || 'Property Title'}
          </h1>
          <div className="flex items-center gap-3 text-slate-500">
            <MapPin className="w-8 h-8 text-slate-900" />
            <span className="text-3xl font-medium tracking-wide">
              {formData.location || 'Location Not Set'}
            </span>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 mb-8"></div>

        {/* Highlights */}
        <div className="mb-auto">
          <p className="text-lg font-bold uppercase tracking-widest text-slate-400 mb-6">Property Highlights</p>
          <div className="grid grid-cols-2 gap-y-5 gap-x-8">
            {highlightsList.length > 0 ? (
              highlightsList.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-900 shrink-0" />
                  <span className="text-2xl font-medium text-slate-700">{highlight}</span>
                </div>
              ))
            ) : (
              <div className="text-2xl text-slate-400 italic">No highlights added.</div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-12 bg-slate-50 rounded-2xl p-6 flex items-center justify-between border border-slate-200">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">Harshavardhan M</span>
              <span className="text-lg font-semibold uppercase tracking-widest text-slate-500 mt-1">Property Consultant</span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
            <Phone className="w-8 h-8 text-slate-900" />
            <span className="text-3xl font-bold text-slate-900 tracking-wider">+91 XXXXX XXXXX</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PropertyPreview;
