
import React, { useState } from 'react';
import { getHolidayRecommendation } from '../services/geminiService';

const AIPlanner: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [destinationType, setDestinationType] = useState('Safari');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlan = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    try {
      const result = await getHolidayRecommendation(
        userInput,
        destinationType,
        startDate || 'TBC',
        endDate || 'TBC',
        guests
      );
      setRecommendation(result);
    } catch (err) {
      setRecommendation("Something went wrong. Let's try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 to-indigo-950 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="80" cy="20" r="30" fill="white" />
          {/* Removed wavy path line */}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-6">AI Dream Planner</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Tell us a bit about your vision. We’ll handle the logistics while you reclaim your most precious asset: time.
            </p>
            
            <div className="space-y-6">
              {/* Quick Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-300">Environment</label>
                  <select 
                    value={destinationType}
                    onChange={(e) => setDestinationType(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Safari" className="text-slate-900">Safari</option>
                    <option value="Sea" className="text-slate-900">Sea</option>
                    <option value="Sun" className="text-slate-900">Sun</option>
                    <option value="Mountain" className="text-slate-900">Mountain</option>
                    <option value="International" className="text-slate-900">International</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-300">Check-in</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-300">Guests</label>
                  <input 
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Story/Preferences */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-300">Your Perfect Day</label>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your ideal vibe, activities, or the specific feeling you're searching for..."
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-6 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-lg"
                />
              </div>

              <button 
                onClick={handlePlan}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-3 ${isLoading ? 'bg-white/20 cursor-not-allowed' : 'bg-white text-blue-900 hover:bg-blue-50 shadow-lg'}`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    <span>Curating your dream...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    <span>Generate My Recommendation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`transition-all duration-700 sticky top-24 ${recommendation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {recommendation ? (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl italic serif">"</div>
                <h3 className="text-2xl font-bold mb-4 text-blue-300">Your Tailored Escape</h3>
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full border border-blue-500/30">
                    {destinationType}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full border border-blue-500/30">
                    {guests} Guest(s)
                  </span>
                </div>
                <p className="text-xl leading-relaxed italic text-white/90">
                  {recommendation}
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <img key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900" src={`https://picsum.photos/100/100?random=${i+10}`} alt="user" />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-indigo-900 flex items-center justify-center text-[10px] font-bold">+12k</div>
                  </div>
                  <button className="text-blue-300 font-bold hover:text-white transition-colors flex items-center">
                    Check Availability <i className="fas fa-calendar-check ml-2"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/20 rounded-3xl h-full min-h-[400px]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-compass text-4xl opacity-30"></i>
                </div>
                <p className="text-white/40 text-lg max-w-xs">Enter your details to reveal a personalized luxury itinerary.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPlanner;
