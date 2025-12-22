
import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
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
            className="w-full h-full object-cover scale-110 animate-[cinematicScroll_10s_ease-in-out_infinite]"
          />
        </div>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/20 to-black/40"></div>

      {/* Content - Centered and purely informational */}
      <div 
        className="relative z-10 text-center px-4 max-w-4xl"
        style={{ 
          transform: `translateY(${-scrollY * 0.1}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="mb-10 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 animate-[fadeIn_1.5s_ease-out]">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold uppercase tracking-widest">Exclusive Membership</span>
        </div>

        <h1 className="text-6xl md:text-9xl text-white font-bold mb-8 leading-[1] drop-shadow-2xl animate-[fadeInUp_1.5s_ease-out_forwards]">
          The Luxury <br /> of <span className="italic serif text-blue-300">Time.</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-white/90 font-light tracking-wide drop-shadow-lg max-w-2xl mx-auto opacity-0 animate-[fadeInUp_1.5s_ease-out_0.5s_forwards]">
          Invest in your future memories with a lifetime ticket to the world's most serene shores.
        </p>
      </div>

      {/* Discovery Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-0 animate-[fadeInUp_1.5s_ease-out_1.2s_forwards]">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to discover</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-blue-400 to-transparent animate-[scrollLine_2s_ease-in-out_infinite]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cinematicScroll {
          0% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1.25) translate(-1%, -1%); }
          100% { transform: scale(1.1) translate(0, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
