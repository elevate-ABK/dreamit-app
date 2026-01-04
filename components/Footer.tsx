
import React, { useState, useEffect, useRef } from 'react';
import { testConnection } from '../services/geminiService';

interface FooterProps {
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
  onLegalClick?: (type: 'privacy' | 'terms') => void;
}

const BRAND_CONFIG_KEY = 'dream_it_brand_config_v2';
const SOCIAL_STORAGE_KEY = 'dream_it_social_links_v2';
const scriptURL = 'https://script.google.com/macros/s/AKfycbw82oR186SCMQlO1lCTrq37t7_NNjxIwEN90_kxm48AJiuxwT-cl48PEKr1LqNmgKir/exec';

const DEFAULT_SOCIALS = {
  facebook: 'https://www.facebook.com/DreamVacationsSA/',
  instagram: 'https://www.instagram.com/dreamvacations_sa/',
  tiktok: 'https://www.tiktok.com/@dreamvacations_sa'
};

const Footer: React.FC<FooterProps> = ({ isAdmin = false, onToggleAdmin, onLegalClick }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agentPhoto, setAgentPhoto] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ status: 'idle' | 'ready' | 'limit' | 'error' | 'billing', message: string }>({ 
    status: 'idle', 
    message: 'Checking...' 
  });
  const agentFileInputRef = useRef<HTMLInputElement>(null);
  
  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      const saved = localStorage.getItem(SOCIAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SOCIALS;
    } catch (e) {
      return DEFAULT_SOCIALS;
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError] = useState('');

  const checkApi = async () => {
    const result = await testConnection();
    setApiStatus(result);
  };

  useEffect(() => {
    const loadConfig = () => {
      const savedBrand = localStorage.getItem(BRAND_CONFIG_KEY);
      if (savedBrand) {
        try {
          const config = JSON.parse(savedBrand);
          setAgentPhoto(config.agentPhoto || null);
        } catch (e) {}
      }
      
      const savedSocial = localStorage.getItem(SOCIAL_STORAGE_KEY);
      if (savedSocial) {
        try {
          setSocialLinks(JSON.parse(savedSocial));
        } catch (e) {}
      }
    };

    loadConfig();
    checkApi();
    window.addEventListener('storage', loadConfig);
    return () => window.removeEventListener('storage', loadConfig);
  }, []);

  const handleAdminClick = () => {
    if (isAdmin) {
      if (onToggleAdmin) onToggleAdmin();
    } else {
      setShowLoginModal(true);
      checkApi();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '072111') {
      if (onToggleAdmin) onToggleAdmin();
      setShowLoginModal(false);
      setPassword('');
      setError('');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  const handleAgentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) {
        alert("This photo is too large. Please use a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAgentPhoto(base64);
        
        const savedBrand = localStorage.getItem(BRAND_CONFIG_KEY);
        let config = savedBrand ? JSON.parse(savedBrand) : {};
        config.agentPhoto = base64;
        localStorage.setItem(BRAND_CONFIG_KEY, JSON.stringify(config));
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialChange = (key: keyof typeof DEFAULT_SOCIALS, value: string) => {
    setSocialLinks((prev: any) => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const saveSocialLinks = () => {
    setSaveStatus('saving');
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(socialLinks));
    
    setTimeout(() => {
      setSaveStatus('saved');
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => {
        setShowAdminSettings(false);
        setSaveStatus('idle');
      }, 1500);
    }, 400);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubError('Valid email required.');
      return;
    }
    setSubStatus('loading');
    try {
      const payload = {
        name: 'Subscriber',
        email: email,
        interest: 'Newsletter',
        source: 'Footer',
        timestamp: new Date().toLocaleString(),
      };
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      setSubStatus('success');
      setEmail('');
    } catch (err) {
      setSubStatus('error');
      setSubError('Subscription failed.');
    }
  };

  const StatusPill = () => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
      apiStatus.status === 'ready' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
      apiStatus.status === 'limit' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
      apiStatus.status === 'billing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
      'bg-slate-500/10 border-slate-500/20 text-slate-500'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        apiStatus.status === 'ready' ? 'bg-green-500 animate-pulse' : 
        apiStatus.status === 'limit' ? 'bg-red-500' : 
        apiStatus.status === 'billing' ? 'bg-amber-500' :
        'bg-slate-500'
      }`}></span>
      {apiStatus.status === 'ready' ? 'API Ready' : 
       apiStatus.status === 'limit' ? 'Quota Full' : 
       apiStatus.status === 'billing' ? 'Billing Req.' :
       'API Offline'}
    </div>
  );

  return (
    <footer className="bg-slate-900 text-slate-400 py-20 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <div className="max-w-md">
             <div className="flex flex-col items-center md:items-start group">
              <div className="flex items-center gap-6 mb-4">
                <span className="text-[10px] font-bold text-white tracking-[0.4em] uppercase opacity-40 text-center md:text-left">Accredited Agent</span>
                {isAdmin && (
                  <button 
                    onClick={() => agentFileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <i className="fas fa-camera text-[10px]"></i>
                  </button>
                )}
              </div>
              
              <div className="relative mb-6">
                {agentPhoto ? (
                  <img 
                    src={agentPhoto} 
                    alt="Agent" 
                    className="h-24 w-auto object-contain rounded-lg filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer"
                  />
                ) : (
                  isAdmin && (
                    <div 
                      onClick={() => agentFileInputRef.current?.click()}
                      className="h-20 w-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30"
                    >
                      <i className="fas fa-plus text-white/20 text-xl mb-1"></i>
                      <span className="text-[8px] font-bold uppercase text-white/20">Photo</span>
                    </div>
                  )
                )}
                <input type="file" ref={agentFileInputRef} onChange={handleAgentPhotoUpload} className="hidden" accept="image/*" />
              </div>

              <p className="text-sm leading-relaxed text-slate-400 max-w-sm text-center md:text-left">
                Your lifetime ticket to investing more time into your holidays, when you need them, and where you want them.
              </p>
            </div>
          </div>

          <div className="max-sm ml-auto w-full">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest text-center md:text-left">Newsletter</h4>
            {subStatus === 'success' ? (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 text-center">
                <i className="fas fa-check text-blue-500 mb-2"></i>
                <h5 className="text-white font-bold text-sm">Subscribed</h5>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex w-full group relative">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="bg-slate-800 border border-slate-700 rounded-l-xl px-5 py-3 w-full focus:ring-1 focus:ring-blue-500 text-white text-sm outline-none transition-all" />
                  <button type="submit" disabled={subStatus === 'loading'} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl transition-colors min-w-[60px]">
                    {subStatus === 'loading' ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
                  </button>
                </div>
                {subError && <p className="text-red-400 text-[11px]">{subError}</p>}
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-[11px] gap-6 relative">
          <div className="flex items-center gap-8">
            <p className="text-slate-500 uppercase tracking-wider font-medium">© 2026. DREAM IT MARKETING.</p>
            <div className="flex space-x-6">
              <button onClick={() => onLegalClick?.('privacy')} className="hover:text-white">Privacy</button>
              <button onClick={() => onLegalClick?.('terms')} className="hover:text-white">Terms</button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-5 text-base">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><i className="fab fa-tiktok"></i></a>
              
              {isAdmin && (
                <div className="relative">
                  <button 
                    onClick={() => { setShowAdminSettings(!showAdminSettings); checkApi(); }} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showAdminSettings ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                  >
                    <i className="fas fa-cog"></i>
                  </button>

                  {showAdminSettings && (
                    <div className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 min-w-[280px] z-[70] animate-[fadeInUp_0.3s_ease-out]">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <i className="fas fa-link text-blue-500"></i> Social Media
                        </h4>
                        <StatusPill />
                      </div>
                      
                      <div className="space-y-5 mb-8">
                        {(['facebook', 'instagram', 'tiktok'] as const).map(platform => (
                          <div key={platform} className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-500 flex items-center gap-2">
                              <i className={`fab fa-${platform === 'facebook' ? 'facebook-square' : platform}`}></i> {platform} URL
                            </label>
                            <input 
                              type="text" 
                              value={socialLinks[platform]} 
                              onChange={(e) => handleSocialChange(platform, e.target.value)} 
                              className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-900"
                              placeholder={`https://${platform}.com/...`}
                            />
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={saveSocialLinks} 
                        disabled={saveStatus === 'saving'}
                        className={`w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                          saveStatus === 'saved' ? 'bg-green-500 shadow-green-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                        } text-white`}
                      >
                        {saveStatus === 'saving' && <i className="fas fa-spinner animate-spin"></i>}
                        {saveStatus === 'saved' ? <><i className="fas fa-lock"></i> Links Locked & Saved</> : 'Save & Lock Social Links'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleAdminClick} className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${isAdmin ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'border-slate-700 hover:border-slate-500 text-slate-500'}`}>
              {isAdmin ? "Exit Admin" : "Admin"}
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><i className="fas fa-lock"></i></div>
              <h3 className="text-2xl font-bold text-slate-900 serif mb-2">Admin Access</h3>
              <div className="flex justify-center mb-4">
                <StatusPill />
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passkey" autoFocus className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 text-slate-900 outline-none" />
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xl shadow-blue-500/20">Authorize</button>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </form>
            <button onClick={() => setShowLoginModal(false)} className="w-full mt-4 text-slate-400 text-xs hover:text-slate-600 uppercase font-bold tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </footer>
  );
};

export default Footer;
