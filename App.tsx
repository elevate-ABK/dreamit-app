
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Benefits from './components/Benefits';
import ResortShowcase from './components/ResortShowcase';
import AIPlanner from './components/AIPlanner';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <Benefits />
        <ResortShowcase />
        <AIPlanner />
      </main>
      <Footer />
    </div>
  );
};

export default App;
