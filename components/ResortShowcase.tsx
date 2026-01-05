
import React, { useState, useEffect, useRef } from 'react';
import { generateImage } from '../services/geminiService';

const CATEGORIES = ['All', 'Sun', 'Safari', 'Sea', 'Mountain'];

/**
 * 🔒 PERMANENT RESORT OVERRIDES
 * To lock your AI images for all users on Vercel:
 * 1. Use the "Export Deployment JSON" button in the Header Admin Panel.
 * 2. Paste the resulting 'resorts' array into this constant.
 */
const CONST_RESORT_OVERRIDE: { id: number; img: string }[] = [];

const DEFAULT_RESORTS = [
  { 
    id: 1, 
    name: 'Mount Amanzi', 
    location: 'Hartbeespoort, Magaliesberg', 
    category: 'Sun', 
    img: 'https://images.unsplash.com/photo-1618245472895-780993510c43?auto=format&fit=crop&q=80&w=1200', 
    url: 'https://www.dreamvacs.com/resorts/mount-amanzi/'
  },
  { 
    id: 2, 
    name: "Finfoot Lake Reserve", 
    location: 'Greater Pilanesberg, North West', 
    category: 'Safari', 
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200', 
    url: 'https://dreamresorts.co.za/hotels-resorts/finfoot-lake-reserve/explore/'
  },
  { 
    id: 3, 
    name: 'Alpine Heath Resort', 
    location: 'Northern Drakensberg, KZN', 
    category: 'Mountain', 
    img: 'https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=1200', 
    url: 'https://www.dreamvacs.com/resorts/alpine-heath/'
  },
  { 
    id: 4, 
    name: 'Breakers Resort', 
    location: 'Umhlanga Rocks, Durban', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1533281813136-1e967a5b3a32?auto=format&fit=crop&q=80&w=1200', 
    url: 'https://www.dreamvacs.com/resorts/breakers-resort/'
  },
  { 
    id: 5, 
    name: 'Blue Marlin Hotel', 
    location: 'Scottburgh, South Coast', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1579624538964-f6558ec40a02?auto=format&fit=crop&q=80&w=1200', 
    url: 'https://www.dreamvacs.com/resorts/blue-marlin-all-inclusive-seascape/'
  },
  { 
    id: 6, 
    name: 'The Peninsula', 
    location: 'Sea Point, Cape Town', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=1200', 
    url: 'https://www.dreamvacs.com/resorts/the-peninsula-all-suite-hotel/'
  },
];

const STORAGE_KEY = 'dream_it_resorts_custom_v3';

interface ResortShowcaseProps {
  isAdmin?: boolean;
}

const ResortShowcase: React.FC<ResortShowcaseProps> = ({ isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [resortList, setResortList] = useState(DEFAULT_RESORTS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState<number | null>(null);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';

  useEffect(() => {
    const hydrateImages = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      let parsedCustom: { id: number; img: string }[] = [];
      
      try {
        if (saved) parsedCustom = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load custom images", e);
      }

      // Merge order: Default -> Override (baked in code) -> LocalStorage (current session)
      const merged = DEFAULT_RESORTS.map(def => {
        const hardcoded = CONST_RESORT_OVERRIDE.find(o => o.id === def.id);
        const custom = parsedCustom.find(p => p.id === def.id);
        
        if (custom) return { ...def, img: custom.img };
        if (hardcoded) return { ...def, img: hardcoded.img };
        return def;
      });
      
      setResortList(merged);
    };

    hydrateImages();
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) hydrateImages();
    });
  }, []);

  const filteredResorts = activeTab === 'All' 
    ? resortList 
    : resortList.filter(r => r.category === activeTab);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_IMAGE) {
      target.src = FALLBACK_IMAGE;
    }
  };

  const handleAIGenerate = async (e: React.MouseEvent, resort: typeof DEFAULT_RESORTS[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin) return;

    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (confirm("AI-generated destination photography requires a Paid API Key. Proceed to selection?")) {
          await aistudio.openSelectKey();
        } else {
          return;
        }
      }
    }

    setIsGenerating(resort.id);
    try {
      let prompt = resort.id === 1 
        ? "A high-quality professional travel photograph of Mount Amanzi resort in South Africa. The scene features the characteristic red-brown 'Harvey tile' roofed chalets and face-brick walls. In the background, the rugged, rocky Magaliesberg mountain ridges are prominent. The foreground includes lush green lawns and indigenous trees near the banks of the Crocodile River. Vertical 2:3 style aspect, no text, cinematic lighting, ultra-realistic."
        : `A high-quality luxury travel photograph of ${resort.name} in ${resort.location}. Focus on ${resort.category} atmosphere, professional resort marketing photography, vertical 3:4 aspect, no text.`;

      const base64 = await generateImage(prompt, "3:4");
      
      const updatedList = resortList.map(r => 
        r.id === resort.id ? { ...r, img: base64 } : r
      );
      setResortList(updatedList);

      const customData = updatedList
        .filter(r => r.img.startsWith('data:'))
        .map(r => ({ id: r.id, img: r.img }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customData));
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      console.error("AI Generation Failed:", err);
      alert(err.message?.includes('429') 
        ? "Daily quota for high-quality image generation reached." 
        : "The AI Visionizer is currently unavailable. Please check your project billing status.");
    } finally {
      setIsGenerating(null);
    }
  };

  const triggerUpload = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin) return;
    setUploadTargetId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTargetId !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        const updatedList = resortList.map(r => 
          r.id === uploadTargetId ? { ...r, img: base64String } : r
        );
        setResortList(updatedList);

        const customData = updatedList
          .filter(r => r.img.startsWith('data:'))
          .map(r => ({ id: r.id, img: r.img }));
        
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(customData));
          window.dispatchEvent(new Event('storage'));
        } catch (err) {
          alert("Storage limit reached. Try using a smaller image file.");
        }
        
        setUploadTargetId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaults = () => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to reset all custom images for THIS browser? (Baked-in overrides will remain)")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <section id="resorts" className="py-24 bg-white">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={onFileChange} 
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">Exclusive Portfolio</span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 leading-tight">Featured Destinations</h2>
            <p className="text-slate-600 max-w-xl">
              {isAdmin ? "Admin: Click wand for AI photography. Use 'Export Manifest' in Header to save these images to GitHub/Vercel permanently." : "Explore our hand-picked collection of luxury resorts near the sun, sea, and safari."}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            {isAdmin && (
              <button 
                onClick={resetToDefaults}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 group"
              >
                <i className="fas fa-undo-alt group-hover:rotate-[-45deg] transition-transform"></i> Reset Local Session
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredResorts.map(resort => (
            <div 
              key={resort.id} 
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-500 bg-slate-200"
            >
              {isGenerating === resort.id && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-6">
                  <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Painting Atmosphere...</p>
                </div>
              )}

              <img 
                src={resort.img} 
                alt={resort.name}
                onError={handleImageError}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none"></div>
              
              <div className="absolute top-4 left-4 flex justify-between items-center w-[calc(100%-2rem)] z-20">
                <span className="text-sm font-bold tracking-widest uppercase bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg min-w-[80px] inline-flex items-center justify-center">
                  {resort.category}
                </span>
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleAIGenerate(e, resort)}
                      title="AI Generate High-Quality Photo"
                      className="w-10 h-10 rounded-full bg-indigo-600/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xl border border-white/30"
                    >
                      <i className="fas fa-magic text-[10px]"></i>
                    </button>
                    <button 
                      onClick={(e) => triggerUpload(e, resort.id)}
                      title="Upload Custom Image"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xl border border-white/30"
                    >
                      <i className="fas fa-camera text-[10px]"></i>
                    </button>
                  </div>
                )}
              </div>

              <a 
                href={resort.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col justify-end p-6 w-full text-white z-10"
              >
                <h3 className="text-xl font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors">{resort.name}</h3>
                <div className="flex items-center text-white/70 text-sm mb-4">
                  <i className="fas fa-map-marker-alt mr-2 text-xs"></i>
                  {resort.location}
                </div>
                <div className="h-0.5 w-0 bg-blue-400 group-hover:w-full transition-all duration-500 mb-4"></div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center">
                  View Resort Details <i className="fas fa-arrow-right ml-2"></i>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="relative py-20 px-8 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 serif tracking-tight">Access Our Full Portfolio</h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed italic serif font-light">
              Explore our complete South African collection—from hidden gems in the Magaliesberg to exclusive Kruger Park lodges and coastal retreats beyond the horizon.
            </p>

            <div className="flex flex-col items-center gap-6">
              <a 
                href="https://www.dreamvacs.com/resorts/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 px-12 py-5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 group text-lg"
              >
                <span>Browse Entire Resort Collection</span>
                <i className="fas fa-external-link-alt text-sm transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"></i>
              </a>
              
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mt-4 opacity-60">
                Global Affiliate Access Included
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResortShowcase;
