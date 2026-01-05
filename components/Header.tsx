
import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onContactClick?: (e?: React.MouseEvent) => void;
  isAdmin?: boolean;
}

const BRAND_CONFIG_KEY = 'dream_it_brand_config_v2';
const RESORT_STORAGE_KEY = 'dream_it_resorts_custom_v3';
const SOCIAL_STORAGE_KEY = 'dream_it_social_links_v2';

/**
 * 🔒 PERMANENT BRANDING OVERRIDES
 * To lock your design for all users on Vercel:
 * 1. Use the "Export Deployment JSON" button in the Admin Panel.
 * 2. Paste the resulting 'brand' object into this constant.
 */
const CONST_BRAND_OVERRIDE: Partial<BrandConfig> | null = null;

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
  const [exporting, setExporting] = useState(false);
  const [config, setConfig] = useState<BrandConfig>({
    logo1: null,
    logo2: null,
    agentPhoto: null,
    scale: 100,
    ...CONST_BRAND_OVERRIDE
  });
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const loadConfigFromStorage = () => {
    const savedConfig = localStorage.getItem(BRAND_CONFIG_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Merge order: Default -> Hardcoded Override -> LocalStorage
        setConfig(prev => ({ ...prev, ...CONST_BRAND_OVERRIDE, ...parsed }));
      } catch (e) {
        console.error("Failed to load brand config", e);
      }
    } else if (CONST_BRAND_OVERRIDE) {
      setConfig(prev => ({ ...prev, ...CONST_BRAND_OVERRIDE }));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    loadConfigFromStorage();
    window.addEventListener('storage', (e) => {
      if (e.key === BRAND_CONFIG_KEY) loadConfigFromStorage();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const updateConfigLocally = (updates: Partial<BrandConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setSaveStatus('idle');
  };

  const handleSaveAndLock = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      try {
        localStorage.setItem(BRAND_CONFIG_KEY, JSON.stringify(config));
        window.dispatchEvent(new Event('storage'));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (e) {
        setSaveStatus('error');
        alert("Images are too large for browser storage. Try using smaller files for the logos.");
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    }, 600);
  };

  const exportDeploymentManifest = () => {
    setExporting(true);
    const manifest = {
      brand: config,
      resorts: JSON.parse(localStorage.getItem(RESORT_STORAGE_KEY) || '[]'),
      socials: JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || '{}'),
      exportedAt: new Date().toISOString()
    };
    
    const manifestString = JSON.stringify(manifest, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(manifestString).then(() => {
      alert("🚀 Deployment Manifest copied to clipboard!\n\nTo 'Lock' this design forever on Vercel:\n1. Provide this JSON to your developer (or me).\n2. We will bake it into the constants for permanent deployment.");
      setExporting(false);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      // Fallback: show in a prompt or console
      console.log("MANIFEST:", manifestString);
      alert("Check console for Manifest (Clipboard failed)");
      setExporting(false);
    });
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
        <div className="absolute top-full left-6 mt-4 bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 min-w-[300px] z-[60] animate-[fadeInDown_0.3s_ease-out]">
          <div className="flex justify-between items-center mb-4">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brand Controls</h4>
             <button 
               onClick={exportDeploymentManifest}
               disabled={exporting}
               title="Export for GitHub/Vercel Deployment"
               className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
             >
               {exporting ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-file-export"></i>}
               Export Manifest
             </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Logo Scale</label>
              <input type="range" min="20" max="400" value={config.scale} onChange={(e) => updateConfigLocally({ scale: parseInt(e.target.value) })} className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>

            <button onClick={handleSaveAndLock} className={`w-full py-3.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg ${saveStatus === 'saved' ? 'bg-green-500 shadow-green-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-100'}`}>
              {saveStatus === 'saving' ? <i className="fas fa-spinner animate-spin mr-2"></i> : null}
              {saveStatus === 'saved' ? <><i className="fas fa-lock mr-2"></i> Design Locked (Local)</> : 'Save & Lock Locally'}
            </button>
            
            <p className="text-[8px] text-slate-400 italic text-center leading-relaxed">
              "Save & Lock" persists changes in THIS browser.<br/>
              Use "Export Manifest" to lock design for ALL visitors.
            </p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </nav>
  );
};

export default Header;
