
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Benefits from './components/Benefits';
import ResortShowcase from './components/ResortShowcase';
import BudgetTool from './components/BudgetTool';
import AIPlanner from './components/AIPlanner';
import Footer from './components/Footer';
import VideoAnimator from './components/VideoAnimator';
import VoiceConcierge from './components/VoiceConcierge';
import ContactFormModal from './components/ContactFormModal';
import LegalOverlay from './components/LegalOverlay';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAnimatorOpen, setIsAnimatorOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacy' | 'terms' | null>(null);

  const openContactModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsContactModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onContactClick={openContactModal} isAdmin={isAdmin} />
      <main className="flex-grow">
        <Hero onContactClick={openContactModal} />
        <About onContactClick={openContactModal} />
        <Benefits />
        <ResortShowcase isAdmin={isAdmin} />
        <AIPlanner />
        <BudgetTool />
      </main>
      <Footer 
        isAdmin={isAdmin} 
        onToggleAdmin={() => setIsAdmin(!isAdmin)} 
        onLegalClick={(type) => setActiveLegalTab(type)}
      />
      
      {/* Lead Capture Modal */}
      {isContactModalOpen && (
        <ContactFormModal onClose={() => setIsContactModalOpen(false)} />
      )}

      {/* Floating Concierge Trigger */}
      <button 
        onClick={() => setIsConciergeOpen(true)}
        className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping"></div>
        <i className="fas fa-comment-dots text-2xl group-hover:hidden"></i>
        <span className="hidden group-hover:block text-[10px] font-bold uppercase tracking-tighter">Concierge</span>
      </button>

      {/* Experimental Video Feature Button (Admin/Power Users) */}
      {isAdmin && (
        <button 
          onClick={() => setIsAnimatorOpen(true)}
          className="fixed bottom-28 right-8 z-[60] w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
          title="Video Visionizer"
        >
          <i className="fas fa-film text-sm"></i>
        </button>
      )}

      {isAnimatorOpen && (
        <VideoAnimator onClose={() => setIsAnimatorOpen(false)} />
      )}

      {isConciergeOpen && (
        <VoiceConcierge onClose={() => setIsConciergeOpen(false)} />
      )}

      {activeLegalTab && (
        <LegalOverlay type={activeLegalTab} onClose={() => setActiveLegalTab(null)} />
      )}
    </div>
  );
};

export default App;
