
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Beach" 
          className="w-full h-full object-cover scale-110 animate-[pulse_10s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl text-white font-bold mb-6 leading-tight drop-shadow-lg">
          Invest in the Luxury <br /> of <span className="italic">Time.</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 font-light tracking-wide drop-shadow">
          Your lifetime ticket to effortless holidays, where quality meets flexibility.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <a 
            href="#resorts" 
            className="bg-white text-blue-900 px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-50 transition-all shadow-xl block"
          >
            Explore Destinations
          </a>
          <a 
            href="#membership" 
            className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-all block"
          >
            Membership Benefits
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-white text-2xl opacity-50"></i>
      </div>
    </section>
  );
};

export default Hero;
