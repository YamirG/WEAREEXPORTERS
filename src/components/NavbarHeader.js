import React, { useState } from 'react';

const NavbarHeader = ({ onLoginClick, onRegisterClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-green-600 to-emerald-800 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-white font-bold text-xl md:text-2xl">
              WeAreExporters
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-white hover:text-green-200 transition-colors">Características</a>
            <a href="#pricing" className="text-white hover:text-green-200 transition-colors">Planes</a>
            <a href="#about" className="text-white hover:text-green-200 transition-colors">Nosotros</a>
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 text-white hover:text-green-100 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={onRegisterClick}
              className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
            >
              Registrarse
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <div className="w-6 h-6" dangerouslySetInnerHTML={{__html: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='3' y1='6' x2='21' y2='6'></line><line x1='3' y1='12' x2='21' y2='12'></line><line x1='3' y1='18' x2='21' y2='18'></line></svg>`}} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <a href="#features" className="block py-2 text-white hover:text-green-200">Características</a>
            <a href="#pricing" className="block py-2 text-white hover:text-green-200">Planes</a>
            <a href="#about" className="block py-2 text-white hover:text-green-200">Nosotros</a>
            <button 
              onClick={onLoginClick}
              className="block w-full text-left py-2 text-white hover:text-green-200"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={onRegisterClick}
              className="mt-2 block w-full px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50"
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavbarHeader;