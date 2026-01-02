
import React, { useState, useEffect } from 'react';

interface HeroProps {
  onContactClick?: (e?: React.MouseEvent) => void;
}

const BRAND_CONFIG_KEY = 'dream_it_brand_config_v2';

const Hero: React.FC<HeroProps> = ({ onContactClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [logos, setLogos] = useState<{ logo1: string | null; logo2: string | null }>({ logo1: null, logo2: null });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Load logos
    const saved = localStorage.getItem(BRAND_CONFIG_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setLogos({ logo1: config.logo1, logo2: config.logo2 });
      } catch (e) {
        console.error("Failed to load logos for Hero", e);
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const LogoSignature = () => {
    const hasLogos = logos.logo1 || logos.logo2;
    if (!hasLogos) return <div className="mb-10" />;
    return (
      <div className="flex flex-col items-start gap-4 mb-6 md:mb-10 opacity-0 animate-[fadeInUp_1.5s_ease-out_0.2s_forwards]">
        <div className="flex items-center gap-4 md:gap-8">
          {logos.logo1 && (
            <img src={logos.logo1} alt="Logo 1" className="h-12 md:h-16 object-contain" />
          )}
          {logos.logo2 && (
            <img src={logos.logo2} alt="Logo 2" className="h-12 md:h-16 object-contain" />
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="home" className="relative h-screen flex items-center overflow-hidden bg-slate-900">
      {/* 10-Second Cinematic "Scroll" Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          transform: `translateY(${scrollY * 0.4}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="w-full h-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Beach" 
            className="w-full h-full object-cover scale-110 animate-[cinematicScroll_15s_ease-in-out_infinite]"
          />
        </div>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

      {/* Content - Left Aligned for classic luxury feel */}
      <div 
        className="relative z-10 w-full max-w-7xl mx-auto px-6"
        style={{ 
          transform: `translateY(${-scrollY * 0.05}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="max-w-4xl">
          <LogoSignature />
          
          <h1 className="text-6xl md:text-[10rem] text-white font-bold mb-8 leading-[0.9] drop-shadow-2xl animate-[fadeInUp_1.5s_ease-out_forwards]">
            The Luxury <br /> 
            of <span className="italic serif text-blue-300">Time.</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-white/90 font-light tracking-wide drop-shadow-lg opacity-0 animate-[fadeInUp_1.5s_ease-out_0.5s_forwards] mb-12 max-w-2xl">
            Invest in your future memories with a lifetime ticket to the world's most serene shores.
          </p>

          <div className="opacity-0 animate-[fadeInUp_1.5s_ease-out_0.8s_forwards]">
             <button 
              onClick={onContactClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/40 inline-block"
            >
              Join the Club
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Indicator */}
      <div className="absolute bottom-12 left-6 z-20 flex flex-col items-start gap-4 opacity-0 animate-[fadeInUp_1.5s_ease-out_1.2s_forwards]">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to discover</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-blue-400 to-transparent animate-[scrollLine_2s_ease-in-out_infinite]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cinematicScroll {
          0% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1.2) translate(-1%, -1%); }
          100% { transform: scale(1.1) translate(0, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}} />
    </section>
  );
};

export default Hero;
