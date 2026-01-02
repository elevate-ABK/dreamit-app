
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
    
    // Listen for storage changes (even in the same window via custom dispatch)
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
    
    // Slight delay for visual confirmation
    setTimeout(() => {
      try {
        // Before saving, we double check if the footer has updated the agentPhoto in storage
        const currentStored = localStorage.getItem(BRAND_CONFIG_KEY);
        let finalConfig = { ...config };
        
        if (currentStored) {
           const parsed = JSON.parse(currentStored);
           if (parsed.agentPhoto && !config.agentPhoto) {
              finalConfig.agentPhoto = parsed.agentPhoto;
           }
        }

        localStorage.setItem(BRAND_CONFIG_KEY, JSON.stringify(finalConfig));
        
        // Notify other components
        window.dispatchEvent(new Event('storage'));
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (e) {
        console.error("Persistence Error:", e);
        setSaveStatus('error');
        alert("The images you uploaded are too large for browser storage. Please try using smaller image files (under 1MB each) to ensure they can be locked in.");
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    }, 600);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) {
        alert("This file is quite large and may fail to save. Please try a smaller image.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (slot === 1) updateConfigLocally({ logo1: base64 });
        else updateConfigLocally({ logo2: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = (slot: 1 | 2) => {
    if (window.confirm(`Reset Logo ${slot} to default?`)) {
      if (slot === 1) updateConfigLocally({ logo1: null });
      else updateConfigLocally({ logo2: null });
    }
  };

  const getLogoHeight = () => {
    const base = isScrolled ? 36 : 90;
    return (base * (config.scale / 100));
  };

  const getPlaceholderSize = () => {
    const base = isScrolled ? 32 : 80;
    return (base * (config.scale / 100));
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ease-in-out ${isScrolled ? 'bg-glass py-2 shadow-sm border-b border-slate-200/50' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-6 md:gap-10">
          {/* Main Brand Text - Bold and Popping */}
          <div className={`transition-all duration-500 transform ${isScrolled ? 'scale-75' : 'scale-100'} origin-left`}>
            <div className={`font-black uppercase tracking-tighter leading-none whitespace-nowrap drop-shadow-lg ${isScrolled ? 'text-xl gradient-text' : 'text-3xl md:text-5xl text-white'}`}>
              Dream it <br className={isScrolled ? 'hidden' : 'block'} />
              <span className={isScrolled ? '' : 'text-blue-400'}>marketing</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 transform-gpu transition-all duration-500">
            {/* Logo Slot 1 */}
            <div className="relative group flex items-center justify-center">
              {config.logo1 ? (
                <img 
                  src={config.logo1} 
                  alt="Brand Logo 1" 
                  style={{ height: `${getLogoHeight()}px` }}
                  className="object-contain transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[height]"
                />
              ) : (
                isAdmin ? (
                  <div 
                    style={{ width: `${getPlaceholderSize()}px`, height: `${getPlaceholderSize()}px` }}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-700 ease-in-out ${isScrolled ? 'border-blue-600/20 bg-blue-600/5' : 'border-white/20 bg-white/5'}`}
                  >
                     <button onClick={() => fileInputRef1.current?.click()} className="text-xs font-bold text-white/40 hover:text-white transition-colors flex flex-col items-center">
                       <i className="fas fa-plus mb-1"></i>
                     </button>
                  </div>
                ) : null
              )}
              {isAdmin && config.logo1 && (
                <button 
                  onClick={() => fileInputRef1.current?.click()}
                  className="absolute -right-2 -top-2 w-6 h-6 bg-white text-blue-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-50 border border-slate-100"
                >
                  <i className="fas fa-sync-alt text-[10px]"></i>
                </button>
              )}
              <input type="file" ref={fileInputRef1} onChange={(e) => handleLogoUpload(e, 1)} className="hidden" accept="image/*" />
            </div>

            {/* Logo Slot 2 */}
            <div className="relative group flex items-center justify-center">
              {config.logo2 ? (
                <img 
                  src={config.logo2} 
                  alt="Brand Logo 2" 
                  style={{ height: `${getLogoHeight()}px` }}
                  className="object-contain transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[height]"
                />
              ) : (
                isAdmin ? (
                  <div 
                    style={{ width: `${getPlaceholderSize()}px`, height: `${getPlaceholderSize()}px` }}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-700 ease-in-out ${isScrolled ? 'border-indigo-600/20 bg-indigo-600/5' : 'border-white/20 bg-white/5'}`}
                  >
                     <button onClick={() => fileInputRef2.current?.click()} className="text-xs font-bold text-white/40 hover:text-white transition-colors flex flex-col items-center">
                       <i className="fas fa-plus mb-1"></i>
                     </button>
                  </div>
                ) : null
              )}
              {isAdmin && config.logo2 && (
                <button 
                  onClick={() => fileInputRef2.current?.click()}
                  className="absolute -right-2 -top-2 w-6 h-6 bg-white text-indigo-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-50 border border-slate-100"
                >
                  <i className="fas fa-sync-alt text-[10px]"></i>
                </button>
              )}
              <input type="file" ref={fileInputRef2} onChange={(e) => handleLogoUpload(e, 2)} className="hidden" accept="image/*" />
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowDesignPanel(!showDesignPanel)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${showDesignPanel ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white/10 text-slate-400 border-slate-200/20 hover:bg-white/20 hover:text-white'}`}
                title="Logo Design Panel"
              >
                <i className="fas fa-palette text-sm"></i>
              </button>
              
              {showDesignPanel && (
                <div className="absolute top-full left-6 mt-6 bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 min-w-[320px] animate-[slideUp_0.3s_ease-out] z-[60]">
                   <div className="flex items-center justify-between mb-8">
                     <div>
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Identity Control</h4>
                       <p className="text-[9px] text-slate-400">Lock your global brand assets.</p>
                     </div>
                     <button onClick={() => setShowDesignPanel(false)} className="text-slate-300 hover:text-slate-500">
                       <i className="fas fa-times text-xs"></i>
                     </button>
                   </div>
                   
                   <div className="space-y-8">
                     <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Global Size</span>
                          <span className="text-xs font-black text-slate-900">{config.scale}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="400" 
                          value={config.scale} 
                          onChange={(e) => updateConfigLocally({ scale: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                     </div>

                     <div className="pt-6 border-t border-slate-50">
                        <button 
                          onClick={handleSaveAndLock}
                          disabled={saveStatus === 'saving'}
                          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg ${
                            saveStatus === 'saved' 
                              ? 'bg-green-500 text-white shadow-green-500/20' 
                              : saveStatus === 'saving'
                                ? 'bg-blue-400 text-white'
                                : saveStatus === 'error'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                          }`}
                        >
                          {saveStatus === 'saved' ? (
                            <>
                              <i className="fas fa-check"></i>
                              Changes Locked
                            </>
                          ) : saveStatus === 'saving' ? (
                            <>
                              <i className="fas fa-circle-notch animate-spin"></i>
                              Saving Assets...
                            </>
                          ) : saveStatus === 'error' ? (
                            <>
                              <i className="fas fa-exclamation-triangle"></i>
                              Failed - Try Smaller
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save"></i>
                              Save & Lock Brand
                            </>
                          )}
                        </button>
                        <p className="mt-3 text-[8px] text-slate-400 text-center leading-relaxed">
                          Locks logos, scaling, and the footer photo across the entire application.
                        </p>
                     </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={onContactClick}
            className={`transition-all duration-700 transform hover:scale-105 inline-block text-center font-bold uppercase tracking-widest shadow-lg ${
              isScrolled 
                ? 'bg-blue-600 text-white px-6 py-2 text-[10px] rounded-full shadow-blue-600/20' 
                : 'bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-3 text-xs rounded-xl hover:bg-white/20'
            }`}
          >
            {isScrolled ? 'Join' : 'Join the Club'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </nav>
  );
};

export default Header;
