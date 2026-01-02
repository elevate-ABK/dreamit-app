
import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onContactClick?: (e?: React.MouseEvent) => void;
  isAdmin?: boolean;
}

const BRAND_CONFIG_KEY = 'dream_it_brand_config_v2';

interface BrandConfig {
  logo1: string | null;
  logo2: string | null;
  agentPhoto: string | null;
  scale: number;
}

const Header: React.FC<HeaderProps> = ({ onContactClick, isAdmin = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [config, setConfig] = useState<BrandConfig>({
    logo1: null,
    logo2: null,
    agentPhoto: null,
    scale: 100,
  });
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const loadConfigFromStorage = () => {
    const savedConfig = localStorage.getItem(BRAND_CONFIG_KEY);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to load brand config", e);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    loadConfigFromStorage();
    window.addEventListener('storage', loadConfigFromStorage);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', loadConfigFromStorage);
    };
  }, []);

  const updateConfigLocally = (updates: Partial<BrandConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setSaveStatus('idle');
  };

  const handleSaveAndLock = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      try {
        const currentStored = localStorage.getItem(BRAND_CONFIG_KEY);
        let finalConfig = { ...config };
        
        if (currentStored) {
           const parsed = JSON.parse(currentStored);
           if (parsed.agentPhoto && !config.agentPhoto) {
              finalConfig.agentPhoto = parsed.agentPhoto;
           }
        }

        localStorage.setItem(BRAND_CONFIG_KEY, JSON.stringify(finalConfig));
        window.dispatchEvent(new Event('storage'));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (e) {
        setSaveStatus('error');
        alert("The images you uploaded are too large. Please use smaller files.");
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    }, 600);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (slot === 1) updateConfigLocally({ logo1: base64 });
        else updateConfigLocally({ logo2: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const getLogoHeight = () => {
    const base = isScrolled ? 30 : 60;
    return (base * (config.scale / 100));
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ease-in-out ${isScrolled ? 'bg-glass py-2 shadow-sm border-b border-slate-200/50' : 'bg-transparent py-5 md:py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-6 md:gap-10">
          {/* Main Brand Text - More refined to avoid Hero overlap */}
          <div className={`transition-all duration-700 transform ${isScrolled ? 'scale-[0.8]' : 'scale-100'} origin-left cursor-default select-none`}>
            <div className="flex flex-col leading-tight">
              <span className={`text-2xl md:text-4xl font-black uppercase tracking-tighter transition-colors duration-500 ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
                Dream it
              </span>
              <span className={`text-xs md:text-sm font-black uppercase tracking-[0.3em] transition-all duration-500 ${isScrolled ? 'text-slate-900' : 'text-blue-400'}`}>
                marketing
              </span>
            </div>
          </div>

          {/* Logo Slots */}
          <div className="flex items-center gap-3 md:gap-6 transform-gpu transition-all duration-500">
            {[1, 2].map((slot) => (
              <div key={slot} className="relative group flex items-center justify-center">
                {slot === 1 ? (
                  config.logo1 ? (
                    <img src={config.logo1} alt="Logo 1" style={{ height: `${getLogoHeight()}px` }} className="object-contain transition-all duration-700" />
                  ) : isAdmin && (
                    <div style={{ width: `${isScrolled ? 24 : 50}px`, height: `${isScrolled ? 24 : 50}px` }} className="border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10" onClick={() => fileInputRef1.current?.click()}>
                      <i className="fas fa-plus text-[10px] text-white/30"></i>
                    </div>
                  )
                ) : (
                  config.logo2 ? (
                    <img src={config.logo2} alt="Logo 2" style={{ height: `${getLogoHeight()}px` }} className="object-contain transition-all duration-700" />
                  ) : isAdmin && (
                    <div style={{ width: `${isScrolled ? 24 : 50}px`, height: `${isScrolled ? 24 : 50}px` }} className="border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10" onClick={() => fileInputRef2.current?.click()}>
                      <i className="fas fa-plus text-[10px] text-white/30"></i>
                    </div>
                  )
                )}
                {isAdmin && (slot === 1 ? config.logo1 : config.logo2) && (
                  <button onClick={() => slot === 1 ? fileInputRef1.current?.click() : fileInputRef2.current?.click()} className="absolute -right-2 -top-2 w-6 h-6 bg-white text-blue-600 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <i className="fas fa-sync-alt text-[10px]"></i>
                  </button>
                )}
              </div>
            ))}
            <input type="file" ref={fileInputRef1} onChange={(e) => handleLogoUpload(e, 1)} className="hidden" accept="image/*" />
            <input type="file" ref={fileInputRef2} onChange={(e) => handleLogoUpload(e, 2)} className="hidden" accept="image/*" />
          </div>

          {isAdmin && (
            <button 
              onClick={() => setShowDesignPanel(!showDesignPanel)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showDesignPanel ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
            >
              <i className="fas fa-palette text-sm"></i>
            </button>
          )}
        </div>

        <div>
          <button 
            onClick={onContactClick}
            className={`transition-all duration-700 transform hover:scale-105 font-bold uppercase tracking-widest ${
              isScrolled 
                ? 'bg-blue-600 text-white px-5 py-2 text-[10px] rounded-full' 
                : 'bg-white/10 backdrop-blur-md text-white border border-white/30 px-6 py-3 text-xs rounded-xl'
            }`}
          >
            {isScrolled ? 'Join' : 'Join the Club'}
          </button>
        </div>
      </div>

      {showDesignPanel && (
        <div className="absolute top-full left-6 mt-4 bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 min-w-[280px] z-[60]">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Brand Controls</h4>
          <input type="range" min="20" max="400" value={config.scale} onChange={(e) => updateConfigLocally({ scale: parseInt(e.target.value) })} className="w-full mb-6" />
          <button onClick={handleSaveAndLock} className={`w-full py-3 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-slate-900'}`}>
            {saveStatus === 'saved' ? 'Changes Locked' : 'Save & Lock Brand'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;
