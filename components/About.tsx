
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1000" 
              alt="Holiday Family" 
              className="relative z-10 rounded-2xl shadow-2xl"
            />
          </div>
          
          <div>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-snug">
              Picture Your Perfect Holiday.
            </h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                Perhaps it’s lounging beneath the warm sun, listening to the waves tugging at the shore. 
                Maybe it’s windows-down drives with the kids, shared playlists, and afternoon braais.
              </p>
              <p className="font-semibold text-slate-900 text-xl serif italic border-l-4 border-blue-500 pl-6">
                Whatever you imagine your perfect holiday to be, there is always one thing it centres on — <span className="text-blue-600 underline">Time.</span>
              </p>
              <p>
                Holidays are opportunities to refocus our time away from the things we have to do and invest in all the things we want to do. 
                If you value your time, you’ll want to become a member of <strong>Dream it marketing</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
