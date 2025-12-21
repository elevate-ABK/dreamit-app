
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Benefits from './components/Benefits';
import ResortShowcase from './components/ResortShowcase';
import AIPlanner from './components/AIPlanner';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <Benefits />
        <ResortShowcase isAdmin={isAdmin} />
        <AIPlanner />
      </main>
      <Footer isAdmin={isAdmin} onToggleAdmin={() => setIsAdmin(!isAdmin)} />
    </div>
  );
};

export default App;
