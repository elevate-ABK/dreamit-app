
import React, { useState, useEffect, useRef } from 'react';

interface FooterProps {
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
  onLegalClick?: (type: 'privacy' | 'terms') => void;
}

const BRAND_CONFIG_KEY = 'dream_it_brand_config_v2';
const SOCIAL_STORAGE_KEY = 'dream_it_social_links_v1';
const scriptURL = 'https://script.google.com/macros/s/AKfycbw82oR186SCMQlO1lCTrq37t7_NNjxIwEN90_kxm48AJiuxwT-cl48PEKr1LqNmgKir/exec';

const DEFAULT_SOCIALS = {
  facebook: 'https://www.facebook.com/DreamVacationsSA/',
  instagram: 'https://www.instagram.com/dreamvacations_sa/',
  tiktok: 'https://www.tiktok.com/@dreamvacations_sa'
};

const Footer: React.FC<FooterProps> = ({ isAdmin = false, onToggleAdmin, onLegalClick }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSocialEditor, setShowSocialEditor] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agentPhoto, setAgentPhoto] = useState<string | null>(null);
  const agentFileInputRef = useRef<HTMLInputElement>(null);
  
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIALS);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError] = useState('');

  const loadAllConfigs = () => {
    // Load brand config for agent photo
    const savedBrand = localStorage.getItem(BRAND_CONFIG_KEY);
    if (savedBrand) {
      try {
        const config = JSON.parse(savedBrand);
        setAgentPhoto(config.agentPhoto || null);
      } catch (e) {
        console.error("Failed to load brand config in footer", e);
      }
    }

    // Load social links
    const savedSocial = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (savedSocial) {
      try {
        setSocialLinks(JSON.parse(savedSocial));
      } catch (e) {
        console.error("Failed to load social links", e);
      }
    }
  };

  useEffect(() => {
    loadAllConfigs();
    window.addEventListener('storage', loadAllConfigs);
    return () => window.removeEventListener('storage', loadAllConfigs);
  }, []);

  const handleAdminClick = () => {
    if (isAdmin) {
      if (onToggleAdmin) onToggleAdmin();
    } else {
      setShowLoginModal(true);
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
        alert("This photo is too large and might not save. Please use a smaller image.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAgentPhoto(base64);
        
        // Update local storage immediately so Header's 'Save & Lock' can grab it
        const savedBrand = localStorage.getItem(BRAND_CONFIG_KEY);
        let config = savedBrand ? JSON.parse(savedBrand) : {};
        config.agentPhoto = base64;
        
        try {
          localStorage.setItem(BRAND_CONFIG_KEY, JSON.stringify(config));
          // Notify other components (Header) that agent photo updated
          window.dispatchEvent(new Event('storage'));
        } catch (err) {
          alert("Storage limit reached. Please use a smaller photo.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSocialLinks = (newLinks: typeof DEFAULT_SOCIALS) => {
    setSocialLinks(newLinks);
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(newLinks));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubError('Please enter a valid email address.');
      return;
    }
    setSubStatus('loading');
    try {
      const payload = {
        name: 'Newsletter Subscriber',
        email: email,
        phone: 'N/A',
        interest: 'Newsletter Subscription',
        source: 'Footer Newsletter',
        timestamp: new Date().toLocaleString(),
        dream: 'Wants to stay updated on luxury resort collections.'
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
      setSubError('Connection failed. Please try again.');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-20 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 mb-20 text-center md:text-left">
          <div className="max-w-md mx-auto md:mx-0">
             <div className="flex flex-col items-center md:items-start mb-8 group">
              <div className="flex items-center gap-6 mb-4">
                <span className="text-[10px] font-bold text-white tracking-[0.4em] uppercase opacity-40">Accredited Agents</span>
                {isAdmin && (
                  <button 
                    onClick={() => agentFileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Change Accredited Photo"
                  >
                    <i className="fas fa-camera text-[10px]"></i>
                  </button>
                )}
              </div>
              
              <div className="relative mb-6">
                {agentPhoto ? (
                  <div className="relative group/agent">
                    <img 
                      src={agentPhoto} 
                      alt="Accredited Representative" 
                      className="h-24 w-auto object-contain rounded-lg filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer"
                    />
                    {isAdmin && (
                      <div className="absolute -bottom-2 -right-2 text-[8px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase tracking-widest opacity-0 group-hover/agent:opacity-100 transition-opacity">
                        Click Save & Lock above to finalize
                      </div>
                    )}
                  </div>
                ) : (
                  isAdmin && (
                    <div 
                      onClick={() => agentFileInputRef.current?.click()}
                      className="h-20 w-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-colors"
                    >
                      <i className="fas fa-id-badge text-white/20 text-xl mb-1"></i>
                      <span className="text-[8px] font-bold uppercase text-white/20">Add Photo</span>
                    </div>
                  )
                )}
                <input type="file" ref={agentFileInputRef} onChange={handleAgentPhotoUpload} className="hidden" accept="image/*" />
              </div>

              <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                Your lifetime ticket to investing more time into your holidays, when you need them, and where you want them.
              </p>
            </div>
          </div>

          <div className="max-w-sm mx-auto md:ml-auto md:mr-0 w-full">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Newsletter</h4>
            {subStatus === 'success' ? (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 text-center animate-[fadeIn_0.5s_ease-out]">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
                  <i className="fas fa-check"></i>
                </div>
                <h5 className="text-white font-bold text-sm">Welcome to the Club!</h5>
                <button onClick={() => setSubStatus('idle')} className="mt-4 text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest">Add another email</button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex w-full group relative">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" disabled={subStatus === 'loading'} className="bg-slate-800 border border-slate-700 rounded-l-xl px-5 py-3 w-full focus:ring-1 focus:ring-blue-500 text-white text-sm outline-none transition-all disabled:opacity-50" />
                  <button type="submit" disabled={subStatus === 'loading'} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl transition-colors shadow-lg shadow-blue-900/20 disabled:bg-slate-700 flex items-center justify-center min-w-[60px]">
                    {subStatus === 'loading' ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
                  </button>
                </div>
                {subError && <p className="text-red-400 text-[11px] font-medium animate-[fadeIn_0.3s_ease-out]">{subError}</p>}
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-[11px] gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-slate-500 uppercase tracking-wider font-medium">© 2026. ACCREDITED AGENTS of the Dream Vacation club.</p>
            <div className="flex space-x-6">
              <button onClick={() => onLegalClick?.('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => onLegalClick?.('terms')} className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-5 text-base">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><i className="fab fa-tiktok"></i></a>
              {isAdmin && (
                <button onClick={() => setShowSocialEditor(!showSocialEditor)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showSocialEditor ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                  <i className="fas fa-cog"></i>
                </button>
              )}
            </div>
            <button onClick={handleAdminClick} className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${isAdmin ? 'bg-blue-600/10 text-blue-400 border-blue-400/50' : 'border-slate-700 hover:border-slate-500 text-slate-500'}`}>
              {isAdmin ? "Exit Admin" : "Admin"}
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><i className="fas fa-user-shield"></i></div>
              <h3 className="text-2xl font-bold text-slate-900">Admin Login</h3>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoFocus className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 text-slate-900" />
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg">Enter Admin Mode</button>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </form>
            <button onClick={() => setShowLoginModal(false)} className="w-full mt-4 text-slate-400 text-xs hover:text-slate-600">Cancel</button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
