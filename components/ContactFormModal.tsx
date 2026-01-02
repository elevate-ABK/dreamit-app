
import React, { useState } from 'react';

interface ContactFormModalProps {
  onClose: () => void;
}

/**
 * 🛠️ UPDATED SECURE LEAD SCRIPT (A-H Mapping):
 * 
 * function doPost(e) {
 *   try {
 *     var sheet = SpreadsheetApp.openById('1dMEQx5LWrn4eu6aK-3rwJByUQtgF-xchm--DQgPbsbQ').getSheets()[0];
 *     var contents = e.postData.contents;
 *     var data = JSON.parse(contents);
 *     
 *     // Append Row with Fallbacks
 *     sheet.appendRow([
 *       data.name || "N/A",
 *       data.email || "",
 *       data.phone || "N/A",
 *       data.interest || "General",
 *       data.dream || "No details provided",
 *       data.timestamp || new Date().toLocaleString(),
 *       data.source || "Website Form"
 *     ]);
 *     
 *     // 📧 AUTO-RESPONSE LOGIC
 *     if (data.email && data.email.includes('@')) {
 *       var subject = "Dream it marketing - Your Luxury Escape Begins";
 *       var body = "Hi " + (data.name || "there") + ",\n\n" +
 *                  "Thank you for reaching out to Dream it marketing. We have received your inquiry regarding " + (data.interest || "our collections") + ".\n\n" +
 *                  "Your request is being reviewed by one of our elite travel consultants. We look forward to helping you reclaim the luxury of Time.\n\n" +
 *                  "IMPORTANT: Please check your 'Spam' or 'Promotions' folder and mark us as 'Not Spam' to ensure you receive our personalized itinerary.\n\n" +
 *                  "Warm regards,\nThe Dream it Team";
 *       MailApp.sendEmail(data.email, subject, body);
 *     }
 *
 *     return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
 *   } catch(err) {
 *     return ContentService.createTextOutput(JSON.stringify({result: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 */

const scriptURL: string = 'https://script.google.com/macros/s/AKfycbwQYXBXuV97RHitj_Qj1z3_hrzee5BfnE3xBV95ykrPFAiaHl8-nDY_9PjWZLyq5_4q/exec';

const ContactFormModal: React.FC<ContactFormModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    dream: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        interest: formData.interest,
        dream: formData.dream,
        timestamp: new Date().toLocaleString(),
        source: 'Interactive Contact Form'
      };

      // Using no-cors and text/plain for maximum compatibility with Google Apps Script
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      setStep(5);
    } catch (err) {
      setError("Secure submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step < 5) {
      e.preventDefault();
      nextStep();
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto" onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={onClose}></div>
      
      {step <= totalSteps && (
        <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-[110]">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <div className="relative w-full max-w-2xl text-white py-12">
        <button onClick={onClose} className="absolute -top-4 right-0 md:-right-16 w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white">
          <i className="fas fa-times text-2xl"></i>
        </button>

        <div className="space-y-12">
          {step === 1 && (
            <div className="animate-[slideIn_0.5s_ease-out]">
              <h2 className="text-3xl md:text-5xl font-bold serif mb-8">What should we call you?</h2>
              <input autoFocus type="text" placeholder="Full name..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-4 text-2xl md:text-4xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/20" />
              <button onClick={nextStep} disabled={!formData.name} className="mt-8 bg-blue-600 px-8 py-3 rounded-lg font-bold disabled:opacity-30">OK</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[slideIn_0.5s_ease-out]">
              <h2 className="text-3xl md:text-5xl font-bold serif mb-8">Where can we reach you?</h2>
              <div className="space-y-8">
                <input autoFocus type="email" placeholder="Email address..." value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-4 text-2xl md:text-4xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/20" />
                <input type="tel" placeholder="Phone number..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-4 text-2xl md:text-4xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/20" />
              </div>
              <div className="mt-12 flex gap-4">
                <button onClick={nextStep} disabled={!formData.email || !formData.phone} className="bg-blue-600 px-8 py-3 rounded-lg font-bold disabled:opacity-30">Continue</button>
                <button onClick={prevStep} className="text-white/40 hover:text-white">Back</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-[slideIn_0.5s_ease-out]">
              <h2 className="text-3xl md:text-5xl font-bold serif mb-8">Which horizon calls to you?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Safari Collection', 'Coastal Escapes', 'Alpine Lodges', 'International Portfolios'].map((opt) => (
                  <button key={opt} onClick={() => { setFormData({ ...formData, interest: opt }); nextStep(); }} className={`text-left p-6 rounded-xl border-2 transition-all ${formData.interest === opt ? 'bg-blue-600 border-blue-600' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    <span className="text-xl font-semibold">{opt}</span>
                  </button>
                ))}
              </div>
              <button onClick={prevStep} className="mt-8 text-white/40">Back</button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-[slideIn_0.5s_ease-out]">
              <h2 className="text-3xl md:text-5xl font-bold serif mb-8">Tell us about your dream.</h2>
              <textarea autoFocus placeholder="I dream of waking up to..." value={formData.dream} onChange={(e) => setFormData({ ...formData, dream: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-4 text-xl md:text-2xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/20 min-h-[150px] resize-none" />
              <div className="mt-12 flex gap-4">
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95">
                  {isSubmitting ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-check"></i>}
                  Submit Inquiry
                </button>
                <button onClick={prevStep} className="text-white/40">Back</button>
              </div>
              {error && <p className="mt-4 text-red-400 text-sm animate-pulse">{error}</p>}
            </div>
          )}

          {step === 5 && (
            <div className="text-center animate-[scaleIn_0.5s_ease-out] py-12">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl">
                <i className="fas fa-paper-plane"></i>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 serif">A world of luxury awaits.</h2>
              <p className="text-xl text-white/60 mb-8 italic">Check your inbox (and spam folder) for our automated confirmation.</p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg mx-auto mb-12">
                <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-2">Pro Tip: Prevent Spam</p>
                <p className="text-sm text-white/70">
                  Please mark our email as <span className="text-white font-bold">"Not Spam"</span> and add us to your contacts. This ensures our future holiday offers reach you directly.
                </p>
              </div>

              <button onClick={onClose} className="bg-white text-slate-900 px-10 py-3 rounded-full font-bold hover:bg-blue-50">Return to Exploration</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default ContactFormModal;
