
import React from 'react';

interface CareersModalProps {
  onClose: () => void;
}

const CareersModal: React.FC<CareersModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.4s_ease-out]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <span className="text-blue-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-1 block">Dream It Marketing</span>
            <h2 className="text-3xl font-bold text-slate-900 serif">
              We Are Hiring!
            </h2>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-slate-200 flex items-center justify-center transition-all group">
            <i className="fas fa-times text-slate-400 group-hover:text-slate-900 transition-colors"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12 text-slate-600 leading-relaxed text-sm space-y-10 scroll-smooth">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-block p-4 rounded-full bg-blue-50 mb-2">
              <i className="fas fa-bullhorn text-3xl text-blue-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 serif">Promotions & Appointment Setters</h3>
            <p className="max-w-xl mx-auto text-slate-500">
              Join our dynamic team at Dream It Marketing! We are looking for energetic individuals to represent our brand at exciting events, malls, and expos.
            </p>
            <div className="inline-block px-6 py-2 bg-green-100 text-green-700 rounded-full font-bold text-xs uppercase tracking-widest">
              No Experience Required • Full Training Provided
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits Column */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 transition-colors">
              <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <i className="fas fa-gift text-blue-500"></i>
                What We Offer
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check text-[10px] text-blue-600"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900">R4000 Basic Salary</strong>
                    <span className="text-xs text-slate-500">+ Commission Structure</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-calendar-check text-[10px] text-blue-600"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900">Monthly Commission</strong>
                    <span className="text-xs text-slate-500">Paid on the 15th</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-money-bill-wave text-[10px] text-blue-600"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900">Additional Commission</strong>
                    <span className="text-xs text-slate-500">Paid every 3 weeks</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-ticket-alt text-[10px] text-blue-600"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900">Exciting Environments</strong>
                    <span className="text-xs text-slate-500">Attend events, malls, and expos</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Requirements Column */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 transition-colors">
              <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <i className="fas fa-user-check text-blue-500"></i>
                Who We Are Looking For
              </h4>
              <ul className="space-y-4">
                {[
                  "Confident & Outgoing",
                  "Great at Communicating",
                  "Great Conversationalist",
                  "Communicative",
                  "Energetic"
                ].map((req, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span className="text-slate-700 font-medium">{req}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <i className="fas fa-map-marker-alt text-red-400"></i>
                  Location: Stonebridge, Phoenix
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-slate-900 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <h4 className="text-2xl font-bold text-white serif mb-6">Ready to Apply?</h4>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Send your CV to us today. Please note that no calls will be accepted.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <a href="mailto:operations@dreamit.co.za" className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95">
                <i className="fas fa-envelope text-blue-600"></i>
                operations@dreamit.co.za
              </a>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://wa.me/27681503694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">WhatsApp (Messages Only)</span>
                    068 150 3694
                  </div>
                </a>
                <div className="text-center text-[10px] text-slate-500">
                  Alternative: 081 486 5776
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
};

export default CareersModal;
