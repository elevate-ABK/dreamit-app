
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-glass py-3 shadow-md' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">D</div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-blue-900' : 'text-white'}`}>Dream it marketing</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {['Home', 'About', 'Resorts', 'Membership'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className={`font-medium transition-colors hover:text-blue-500 ${isScrolled ? 'text-slate-700' : 'text-white'}`}
            >
              {item}
            </a>
          ))}
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105">
          Join the Club
        </button>
      </div>
    </nav>
  );
};

export default Header;
