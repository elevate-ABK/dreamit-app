import React, { useState, useEffect } from 'react';
import { getBudgetEstimate } from '../services/geminiService';

const PORTFOLIO_RESORTS = [
  'Mount Amanzi',
  'Finfoot Lake Reserve',
  'Alpine Heath Resort',
  'Breakers Resort',
  'Blue Marlin Hotel',
  'The Peninsula'
];

const GENERAL_DESTINATIONS = [
  'Safari (General)',
  'Coastal Escapes',
  'Alpine Lodges',
  'International Portfolios',
  'Island Getaways'
];

const TIER_DESCRIPTIONS = {
  'Standard': 'Comfortable and authentic. High-quality 4-star self-catering or luxury hotel rooms ideal for families.',
  'Premium': 'Superior luxury experience. 5-star finishes, prime resort locations, and expansive multi-bedroom suites.',
  'Ultra-Luxe': 'The absolute pinnacle. Exclusive penthouses, private villas, and dedicated bespoke concierge services.'
};

const BudgetTool: React.FC = () => {
  const today = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);

  const [params, setParams] = useState({
    destination: 'Finfoot Lake Reserve',
    adults: 2,
    children: 0,
    tier: 'Premium' as 'Standard' | 'Premium' | 'Ultra-Luxe',
    startDate: today.toISOString().split('T')[0],
    endDate: weekFromNow.toISOString().split('T')[0]
  });
  
  const [nightsCount, setNightsCount] = useState(7);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNightsCount(diffDays || 0);
  }, [params.startDate, params.endDate]);

  const calculateBudget = async () => {
    if (nightsCount <= 0) {
      alert("Please select a valid check-out date after your check-in date.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await getBudgetEstimate(params);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      maximumFractionDigits: 0 
    }).format(val);
  };

  const getSeasonIcon = (season: string) => {
    const s = season.toLowerCase();
    if (s.includes('peak') || s.includes('summer')) return 'fa-sun text-yellow-500';
    if (s.includes('winter') || s.includes('alpine')) return 'fa-snowflake text-blue-300';
    return 'fa-leaf text-green-400';
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Standard': return 'text-slate-400';
      case 'Premium': return 'text-amber-400';
      case 'Ultra-Luxe': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-blue-400 font-bold tracking-[0.2em] uppercase text-[10px]">Real-Time Value Engine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold serif mb-6">Quantify Your Member Advantage</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Directly compare public hotel rates with your fixed-cost Dream Vacation Club benefits. 
            Select your dates and luxury level to see the true financial power of your membership.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-bold serif border-b border-white/10 pb-4">Trip Configuration</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Select Destination / Resort</label>
                  <select 
                    value={params.destination}
                    onChange={(e) => setParams({...params, destination: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <optgroup label="Our Exclusive Portfolio" className="bg-slate-900 text-blue-400">
                      {PORTFOLIO_RESORTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </optgroup>
                    <optgroup label="General Holiday Types" className="bg-slate-900 text-slate-400">
                      {GENERAL_DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Check-In</label>
                    <div className="date-input-container">
                      <input 
                        type="date" 
                        value={params.startDate} 
                        onChange={e => setParams({...params, startDate: e.target.value})} 
                        className="w-full luxury-date-input rounded-xl p-3 text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Check-Out</label>
                    <div className="date-input-container">
                      <input 
                        type="date" 
                        value={params.endDate} 
                        onChange={e => setParams({...params, endDate: e.target.value})} 
                        className="w-full luxury-date-input rounded-xl p-3 text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Duration</span>
                      <span className="text-[10px] text-blue-300/60 italic">Arrival to Departure</span>
                   </div>
                   <div className="text-right">
                      <span className="text-blue-400 font-bold block">{nightsCount} Nights</span>
                      <span className="text-white font-bold text-xs">{nightsCount + 1} Days</span>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Luxury Tier</label>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-white/10 bg-white/5 ${getTierColor(params.tier)}`}>
                      <i className="fas fa-gem mr-1"></i> {params.tier}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(TIER_DESCRIPTIONS).map((t) => (
                      <button 
                        key={t}
                        onClick={() => setParams({...params, tier: t as any})}
                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${params.tier === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-white/10 text-slate-500 hover:border-white/30'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                      "{TIER_DESCRIPTIONS[params.tier]}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Adults</label>
                    <input type="number" min="1" value={params.adults} onChange={e => setParams({...params, adults: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Children</label>
                    <input type="number" min="0" value={params.children} onChange={e => setParams({...params, children: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <button 
                onClick={calculateBudget}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-circle-notch animate-spin"></i>
                    <span>Analysing Tier Economics...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-check"></i>
                    <span>Compare Holiday Costs</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 h-full flex flex-col animate-[fadeIn_0.6s_ease-out] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-8 py-2 font-bold text-[10px] uppercase tracking-[0.3em] rotate-45 translate-x-12 translate-y-4 shadow-lg flex items-center gap-2">
                  <i className={`fas ${getSeasonIcon(result.seasonType)}`}></i>
                  {result.seasonType}
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-blue-400 border border-white/10">
                    <i className={`fas ${result.isPortfolioResort ? 'fa-hotel' : 'fa-map-marked-alt'}`}></i>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold serif">{params.destination}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      {params.tier} • {result.nights} Nights / {result.days} Days • {params.adults + params.children} Guests
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 mb-10 pb-10 border-b border-white/5">
                  <div className="space-y-2">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Public Booking Rate ({params.tier})</p>
                    <p className="text-4xl font-light text-slate-400 line-through decoration-red-500/40">{formatCurrency(result.marketCost)}</p>
                    <p className="text-xs text-slate-500 italic">Avg. {formatCurrency(result.perNightMarket)} / night</p>
                  </div>
                  
                  <div className="space-y-2 relative">
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Your Member Rate</p>
                    <p className="text-5xl font-black text-white">{formatCurrency(result.memberCost)}</p>
                    <p className="text-xs text-blue-400 font-bold tracking-wide">Avg. {formatCurrency(result.perNightMember)} / night</p>
                  </div>
                </div>

                <div className="mb-10">
                   <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Immediate Member Saving</p>
                        <p className="text-4xl font-bold text-blue-500">{formatCurrency(result.marketCost - result.memberCost)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-5xl font-black text-white/10 -mb-2">{result.savingsPercentage}%</p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">Reduction</p>
                      </div>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-1000 ease-out" style={{ width: `${result.savingsPercentage}%` }}></div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-4">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Tier Benefits</p>
                    <ul className="grid grid-cols-1 gap-3">
                      {result.inclusions.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-xs text-slate-400 group">
                          <i className="fas fa-check-circle text-blue-500/60 group-hover:text-blue-500 transition-colors"></i>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Expert Perspective</p>
                    <p className="text-xs text-slate-400 italic leading-relaxed border-l-2 border-blue-500/30 pl-4 py-1">
                      "{result.insight}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center group">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all duration-500">
                  <i className="fas fa-chart-pie opacity-30 group-hover:opacity-100"></i>
                </div>
                <h4 className="text-xl font-bold mb-2">Uncover the Tier Advantage</h4>
                <p className="max-w-xs text-sm text-slate-500 mx-auto">Select your preferred level of luxury to see how the Club makes even the most opulent stays affordable.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
};

export default BudgetTool;