
import React, { useState, useEffect } from 'react';

interface AboutProps {
  onContactClick?: (e?: React.MouseEvent) => void;
}

const BRAND_CONFIG_KEY = 'dream_it_brand_config_v2';

const About: React.FC<AboutProps> = ({ onContactClick }) => {
  const [logos, setLogos] = useState<{ logo1: string | null; logo2: string | null }>({ logo1: null, logo2: null });

  useEffect(() => {
    const saved = localStorage.getItem(BRAND_CONFIG_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setLogos({ logo1: config.logo1, logo2: config.logo2 });
      } catch (e) {
        console.error("Failed to load logos for About section", e);
      }
    }
  }, []);

  const LogoSignature = () => {
    if (!logos.logo1 && !logos.logo2) return null;
    return (
      <div className="flex items-center gap-3 mb-8">
        {logos.logo1 && (
          <img src={logos.logo1} alt="Logo 1" className="h-10 md:h-12 object-contain" />
        )}
        {logos.logo2 && (
          <img src={logos.logo2} alt="Logo 2" className="h-10 md:h-12 object-contain" />
        )}
      </div>
    );
  };

  return (
    <section id="about" className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Visual Composition - Updated to DVC Lifestyle Imagery */}
          <div className="lg:col-span-7 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] md:aspect-video transform hover:scale-[1.02] transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1200" 
                alt="Luxury Resort Lifestyle" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-12 -right-6 md:-right-12 z-20 w-1/2 rounded-2xl overflow-hidden shadow-2xl border-8 border-white hidden md:block animate-[float_6s_ease-in-out_infinite]">
              <img 
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800" 
                alt="South African Safari Experience" 
                className="w-full h-full object-cover aspect-square"
              />
            </div>

            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-50 rounded-full -z-10 blur-3xl opacity-60"></div>
          </div>
          
          {/* Content Composition */}
          <div className="lg:col-span-5">
            <div className="space-y-8">
              <div>
                <LogoSignature />
                <span className="text-blue-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">The Philosophy</span>
                <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-[1.1]">
                  Picture Your <br />
                  <span className="italic serif text-blue-600">Perfect Holiday.</span>
                </h2>
              </div>

              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p className="animate-[fadeInUp_1s_ease-out]">
                  Perhaps it’s lounging beneath the warm sun at <strong>Breakers Resort</strong>, listening to the waves tugging at the Umhlanga shore, feeling the world slow down just for you. 
                  Maybe it’s windows-down drives through the Magaliesberg toward <strong>Mount Amanzi</strong> with the kids, shared playlists, and the nostalgic scent of afternoon braais drifting through the air.
                </p>
                
                <div className="relative py-8 px-8 bg-slate-50 rounded-3xl border-l-4 border-blue-500 italic text-slate-900 serif text-2xl font-light leading-snug">
                  "Whatever you imagine your perfect holiday to be, there is always one thing it centres on — <span className="text-blue-600 font-bold">Time.</span>"
                  <div className="absolute -top-4 -left-4 text-blue-100 text-8xl serif opacity-50 -z-10 select-none">“</div>
                </div>

                <p>
                  Holidays are opportunities to refocus our time away from the things we <span className="italic">have</span> to do and invest in all the things we <span className="italic font-bold">want</span> to do. 
                </p>

                <p className="font-medium text-slate-800">
                  If you value your time, you’ll want to become a member of <strong>Dream Vacation Club</strong>. We don't just sell vacations; we secure your future moments of peace.
                </p>

                <div className="pt-6">
                  <button 
                    onClick={onContactClick}
                    className="inline-flex items-center gap-4 text-blue-600 font-bold uppercase tracking-widest text-sm hover:gap-6 transition-all group"
                  >
                    Discover Membership 
                    <span className="w-12 h-[1px] bg-blue-600 group-hover:w-16 transition-all"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
};

export default About;
