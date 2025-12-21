
import React, { useState } from 'react';

const categories = ['All', 'Sun', 'Safari', 'Sea', 'Mountain'];

const resorts = [
  { 
    id: 1, 
    name: 'Mount Amanzi', 
    location: 'Magaliesberg, Gauteng', 
    category: 'Sun', 
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.dreamvacs.com/resorts/mount-amanzi/'
  },
  { 
    id: 2, 
    name: "Finfoot Lake Reserve", 
    location: 'Greater Pilanesberg, North West', 
    category: 'Safari', 
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/hotels-resorts/finfoot-lake-reserve/explore'
  },
  { 
    id: 3, 
    name: 'Cayley Lodge', 
    location: 'Central Drakensberg, KZN', 
    category: 'Mountain', 
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/cayley-lodge/'
  },
  { 
    id: 4, 
    name: 'Royal Palm', 
    location: 'Umhlanga, Durban', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/royal-palm/'
  },
  { 
    id: 5, 
    name: 'Blue Marlin Hotel', 
    location: 'Scottburgh, KZN South Coast', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/blue-marlin-hotel/'
  },
  { 
    id: 6, 
    name: 'Waterfront Hotel & Spa', 
    location: 'Point Waterfront, Durban', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/the-waterfront-hotel-spa/'
  },
  { 
    id: 7, 
    name: 'Little Eden', 
    location: 'Cullinan, Gauteng', 
    category: 'Sun', 
    img: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/little-eden/'
  },
  { 
    id: 8, 
    name: 'Piekenierskloof Mountain Resort', 
    location: 'Citrusdal, Western Cape', 
    category: 'Mountain', 
    img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/piekenierskloof-mountain-resort/'
  },
  { 
    id: 9, 
    name: 'Zimbali Lodge', 
    location: 'Ballito, Durban North Coast', 
    category: 'Sea', 
    img: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/zimbali-lodge/'
  },
  { 
    id: 10, 
    name: 'Tala Collection', 
    location: 'Camperdown, KZN (Durban Area)', 
    category: 'Safari', 
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    url: 'https://dreamresorts.co.za/tala-collection-game-reserve/'
  }
];

const ResortShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';

  const filteredResorts = activeTab === 'All' 
    ? resorts 
    : resorts.filter(r => r.category === activeTab);

  /**
   * Robust error handler for images.
   * Prevents infinite loops by checking if the source is already the fallback.
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_IMAGE) {
      target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <section id="resorts" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">Exclusive Portfolio</span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 leading-tight">Featured Destinations</h2>
            <p className="text-slate-600 max-w-xl">
              From the coastal beauty of Durban to the tranquil Magaliesberg, discover resorts where time stands still. Click any tile to explore.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResorts.map(resort => (
            <a 
              key={resort.id} 
              href={resort.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-500 bg-slate-200 block"
            >
              <img 
                src={resort.img} 
                alt={resort.name}
                onError={handleImageError}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-black tracking-widest uppercase bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg">
                  {resort.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                <h3 className="text-xl font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors">{resort.name}</h3>
                <div className="flex items-center text-white/70 text-sm mb-4">
                  <i className="fas fa-map-marker-alt mr-2 text-xs"></i>
                  {resort.location}
                </div>
                <div className="h-0.5 w-0 bg-blue-400 group-hover:w-full transition-all duration-500 mb-4"></div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center">
                  View Resort Details <i className="fas fa-arrow-right ml-2"></i>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-6 italic serif text-lg">Seeking a different vibe?</p>
          <a 
            href="https://dreamresorts.co.za/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors group"
          >
            Explore Full Global Portfolio 
            <i className="fas fa-external-link-alt ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ResortShowcase;
