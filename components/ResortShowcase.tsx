
import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = ['All', 'Sun', 'Safari', 'Sea', 'Mountain'];

const DEFAULT_RESORTS = [
  { 
    id: 1, 
    name: 'Mount Amanzi', 
    location: 'Magaliesberg, Gauteng', 
    category: 'Sun', 
    img: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.dreamvacs.com/resorts/mount-amanzi/'
  },
  { 
    id: 2, 
    name: "Finfoot Lake Reserve", 
    location: 'Greater Pilanesberg, North West', 
    category: 'Safari', 
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/hotels-resorts/finfoot-lake-reserve/explore/'
  },
  { 
    id: 3, 
    name: 'Alpine Heath Resort', 
    location: 'Central Drakensberg, KZN', 
    category: 'Mountain', 
    img: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.dreamvacs.com/resorts/alpine-heath/'
  },
  { 
    id: 4, 
    name: 'Breaker Resort', 
    location: 'Umhlanga, Durban', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.dreamvacs.com/resorts/breakers-resort/'
  },
  { 
    id: 5, 
    name: 'Blue Marlin Hotel', 
    location: 'Scottburgh, KZN South Coast', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.dreamvacs.com/resorts/blue-marlin-all-inclusive-seascape/'
  },
  { 
    id: 6, 
    name: 'The Peninsula ', 
    location: 'Sea Point', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
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

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = DEFAULT_RESORTS.map(def => {
          const custom = parsed.find((p: any) => p.id === def.id);
          return custom ? { ...def, img: custom.img } : def;
        });
        setResortList(merged);
      } catch (e) {
        console.error("Failed to load custom images", e);
      }
    }
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
    if (window.confirm("Are you sure you want to reset all custom images?")) {
      setResortList(DEFAULT_RESORTS);
      localStorage.removeItem(STORAGE_KEY);
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
              {isAdmin ? "Admin View: Click the camera icon on any tile to upload your own photos." : "Explore our hand-picked collection of luxury resorts near the sun, sea, and safari."}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            {isAdmin && (
              <button 
                onClick={resetToDefaults}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 group"
              >
                <i className="fas fa-undo-alt group-hover:rotate-[-45deg] transition-transform"></i> Reset Custom Images
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResorts.map(resort => (
            <div 
              key={resort.id} 
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-500 bg-slate-200"
            >
              <img 
                src={resort.img} 
                alt={resort.name}
                onError={handleImageError}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none"></div>
              
              {/* Top Bar - Locked UI Settings */}
              <div className="absolute top-4 left-4 flex justify-between items-center w-[calc(100%-2rem)] z-20">
                {/* LARGE CENTRALIZED LABEL */}
                <span className="text-sm font-bold tracking-widest uppercase bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg min-w-[80px] inline-flex items-center justify-center">
                  {resort.category}
                </span>
                
                {/* CAMERA BUTTON - ADMIN ONLY */}
                {isAdmin && (
                  <button 
                    onClick={(e) => triggerUpload(e, resort.id)}
                    title="Upload Custom Image (Admin Only)"
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xl border border-white/30"
                  >
                    <i className="fas fa-camera text-sm"></i>
                  </button>
                )}
              </div>

              {/* LOCKED LINK SETTINGS */}
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

        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-6 italic serif text-lg">Seeking a different vibe?</p>
          <a 
            href="https://www.dreamvacs.com/resorts/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors group"
          >
            Explore Full Global Portfolio 
            <i className="fas fa-external-link-alt ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ResortShowcase;
