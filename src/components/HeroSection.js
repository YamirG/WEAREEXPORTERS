import React from 'react';

const HeroSection = ({ onGetStarted }) => {
  return (
    <div className="bg-gradient-to-b from-emerald-800 to-green-600 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Conquista mercados internacionales con datos precisos y ventas reales
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Descubre dónde vender tu producto, qué requisitos necesitas y conecta con compradores reales en todo el mundo.
            </p>
            <button 
              onClick={onGetStarted}
              className="px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg transform hover:scale-105 duration-200 text-lg"
            >
              Comenzar ahora
            </button>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-2xl border border-white/20">
              <img 
                src="https://images.unsplash.com/photo-1566633806327-68e152aaf26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Comercio internacional" 
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;