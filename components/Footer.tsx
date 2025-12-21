
import React from 'react';

interface FooterProps {
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
}

const Footer: React.FC<FooterProps> = ({ isAdmin = false, onToggleAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">D</div>
              <span className="text-xl font-bold text-white tracking-tight">Dream it marketing</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your lifetime ticket to investing more time into your holidays, when you need them, and where you want them.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">The Club</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Membership</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Affiliate Resorts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Member Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Booking Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Destinations</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Coastal Escapes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Alpine Lodges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safari Collection</a></li>
              <li><a href="#" className="hover:text-white transition-colors">International Portfolios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm mb-4">Get the latest travel inspiration and resort news.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-slate-800 border-none rounded-l-lg px-4 py-2 w-full focus:ring-1 focus:ring-blue-500 text-white" 
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© 2024 Dream it marketing. All rights reserved.</p>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <button 
              onClick={onToggleAdmin}
              className={`px-3 py-1 rounded border transition-colors ${isAdmin ? 'bg-blue-600/20 text-blue-400 border-blue-400' : 'border-slate-700 hover:border-slate-500'}`}
            >
              {isAdmin ? "Exit Admin Mode" : "Admin Access"}
            </button>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <i className="fab fa-facebook-f cursor-pointer hover:text-white transition-colors"></i>
            <i className="fab fa-instagram cursor-pointer hover:text-white transition-colors"></i>
            <i className="fab fa-linkedin-in cursor-pointer hover:text-white transition-colors"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
