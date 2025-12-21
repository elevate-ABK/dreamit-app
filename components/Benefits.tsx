
import React from 'react';

const benefits = [
  {
    icon: 'fa-globe-africa',
    title: 'Unrivalled Choice',
    desc: 'Beyond traditional hotels: lodges, apartments, chalets, and presidential suites.'
  },
  {
    icon: 'fa-infinity',
    title: 'Total Flexibility',
    desc: 'Holiday when you need them, where you want them, with growing affiliate options.'
  },
  {
    icon: 'fa-certificate',
    title: 'Hand-picked Quality',
    desc: 'All properties selected with a focus on quality and value, near sun, sea, or snow.'
  },
  {
    icon: 'fa-ticket-alt',
    title: 'Lifetime Ticket',
    desc: 'An investment in your future memories that pays dividends in joy and relaxation.'
  }
];

const Benefits: React.FC = () => {
  return (
    <section id="membership" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold mb-6">Why Join the Club?</h2>
          <p className="text-slate-600 text-lg">
            We focus on giving you more choice and flexibility. We’re a club that ventures well beyond simply renting a traditional hotel room.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i className={`fas ${benefit.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
