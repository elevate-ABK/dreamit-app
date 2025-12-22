
import React, { useState } from 'react';

interface FooterProps {
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
}

const Footer: React.FC<FooterProps> = ({ isAdmin = false, onToggleAdmin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminClick = () => {
    if (isAdmin) {
      // If already admin, just exit
      if (onToggleAdmin) onToggleAdmin();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Corrected password as per user request: 072111
    if (password === '072111') {
      if (onToggleAdmin) onToggleAdmin();
      setShowLoginModal(false);
      setPassword('');
      setError('');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 relative">
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
              onClick={handleAdminClick}
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

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fas fa-user-shield"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Admin Login</h3>
              <p className="text-slate-500 text-sm mt-1">Please enter your management password</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className={`w-full p-3 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all`}
                />
                {error && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{error}</p>}
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                Enter Admin Mode
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <a 
                href="mailto:abkdigitalcreations@gmail.com?subject=Dream It Admin Password Reset Request"
                className="text-blue-600 text-xs font-bold hover:underline"
              >
                Forgotten Password? Request Reset
              </a>
              <div>
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setError('');
                    setPassword('');
                  }}
                  className="text-slate-400 text-xs hover:text-slate-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </footer>
  );
};

export default Footer;
