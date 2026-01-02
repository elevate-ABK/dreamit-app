
import React from 'react';

interface LegalOverlayProps {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

const LegalOverlay: React.FC<LegalOverlayProps> = ({ type, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.4s_ease-out]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <span className="text-blue-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-1 block">Legal Information</span>
            <h2 className="text-3xl font-bold text-slate-900 serif">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h2>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-slate-200 flex items-center justify-center transition-all group">
            <i className="fas fa-times text-slate-400 group-hover:text-slate-900 transition-colors"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12 text-slate-600 leading-relaxed text-sm space-y-8 scroll-smooth">
          {type === 'privacy' ? (
            <>
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">1. Our Commitment to POPIA</h3>
                <p>
                  Dream it marketing ("we", "us", "our") is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa. This policy outlines how we collect, process, and secure the data you provide through our luxury digital platforms.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">2. Data Collection & Usage</h3>
                <p>We collect information through several elite touchpoints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Interactive Lead Forms:</strong> Name, email, and contact details provided to schedule travel consultations.</li>
                  <li><strong>AI Concierge (Elena):</strong> Voice inputs are processed in real-time to provide sophisticated travel recommendations. We do not store raw audio recordings permanently; only the derived travel preferences are utilized to personalize your future club experience.</li>
                  <li><strong>Newsletter:</strong> Email addresses provided for curated resort updates.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">3. Third-Party Intelligence</h3>
                <p>
                  Our site utilizes high-end AI services provided by Google Gemini. Data sent to these services (such as prompts for travel recommendations) is processed securely. We do not sell your personal lead data to external brokers. Your information remains within the elite Dream Vacation Club ecosystem.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">4. Your Rights</h3>
                <p>
                  You have the right to request access to the personal data we hold about you, or to request its deletion. For such requests, please contact our Information Officer at the official Dream it marketing headquarters.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">1. Acceptance of Terms</h3>
                <p>
                  By accessing the Dream it marketing platform, you acknowledge that you are engaging with a specialized digital showcase of the Dream Vacation Club portfolio. Your use of this site signifies your agreement to these terms.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">2. Nature of Membership</h3>
                <p>
                  Dream it marketing acts as a specialized agent for the Dream Vacation Club. Membership represents a "right-to-use" points-based system. All resort availability displayed on this site is subject to the Club's internal allocation and booking rules.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">3. AI-Generated Content Disclaimer</h3>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 italic rounded-r-xl">
                  "The AI Dream Planner and Video Visionizer provide simulated luxury experiences. While these tools aim for accuracy, all itineraries, budget estimates, and visual renderings are for illustrative purposes and do not constitute a binding travel contract or guarantee of resort conditions."
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">4. Intellectual Property</h3>
                <p>
                  The brand elements, including the "Luxury of Time" concept, bespoke UI designs, and exclusive resort imagery, are protected intellectual property. Unauthorized reproduction of the Dream it marketing digital identity is strictly prohibited.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 serif">5. Governing Law</h3>
                <p>
                  These terms are governed by the laws of the Republic of South Africa. Any disputes shall be resolved within the jurisdiction of the South African courts.
                </p>
              </section>
            </>
          )}
          
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Last Updated: January 2026
            </p>
            <button 
              onClick={onClose}
              className="px-10 py-3 bg-blue-600 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              I Understand
            </button>
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

export default LegalOverlay;
