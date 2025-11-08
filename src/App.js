// src/App.js
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import NavbarHeader from './components/NavbarHeader';
import HeroSection from './components/HeroSection';
import SearchProductSection from './components/SearchProductSection';
import RequirementsSection from './components/RequirementsSection';
import BuyersSection from './components/BuyersSection';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import FaqSection from './components/FaqSection'; // ajusta la ruta
import FooterSection from './components/FooterSection';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import SubscriptionModal from './components/SubscriptionModal';
import PremiumDashboard from './components/PremiumDashboard';

const MainContent = ({
  onLoginClick,
  onRegisterClick,
  onSwitchToLogin,
  onSwitchToRegister,
  isLoginModalOpen,
  isRegisterModalOpen,
  isSubscriptionModalOpen,
  handleCloseModals,
  handleSelectPlan,
}) => {
  const [currentView, setCurrentView] = useState('home');

  const handleGetStarted = () => {
    setCurrentView('search');
    document.getElementById('search-product')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLimitReached = () => {
    onRegisterClick();
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarHeader
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <SearchProductSection onLimitReached={handleLimitReached} />
        <RequirementsSection onLimitReached={handleLimitReached} />
        <BuyersSection onLimitReached={handleLimitReached} />
        <FeaturesSection />
        {/* 🔹 Este botón abre directamente el RegisterModal */}
        <PricingSection onOpenRegister={onRegisterClick} />
      </main>
      <FaqSection /> 
      <FooterSection />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onSwitchToRegister={onSwitchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseModals}
        onSwitchToLogin={onSwitchToLogin}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={handleCloseModals}
        onSelectPlan={handleSelectPlan}
        onOpenRegister={onRegisterClick}
      />
    </div>
  );
};

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setIsSubscriptionModalOpen(false);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setIsSubscriptionModalOpen(false);
  };

  const handleSwitchToLogin = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const handleSwitchToRegister = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const handleCloseModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsSubscriptionModalOpen(false);
  };

  const handleSelectPlan = (planName) => {
    if (planName === 'Gratuito') {
      localStorage.setItem('queryCount', '0');
      localStorage.setItem('isPremiumUser', 'false');
      handleRegisterClick();
    } else if (planName === 'Premium') {
      localStorage.setItem('isPremiumUser', 'true');
      localStorage.setItem('queryCount', '0');
      handleCloseModals();
      window.location.href = '/premiumdashboard';
    } else {
      handleCloseModals();
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ✅ reCAPTCHA v3 Site Key desde el entorno (Netlify/Local)
  const RECAPTCHA_V3_SITE_KEY =
    process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY || '';

  // Simple sanity check: evita montar el provider con una key vacía/incorrecta
  const hasValidRecaptchaKey = typeof RECAPTCHA_V3_SITE_KEY === 'string' && RECAPTCHA_V3_SITE_KEY.length > 30;

  if (!hasValidRecaptchaKey) {
    console.warn(
      '[reCAPTCHA v3] Site key ausente o inválida. ' +
      'Define REACT_APP_RECAPTCHA_V3_SITE_KEY en tu entorno (Netlify > Environment variables) ' +
      'incluyendo los dominios permitidos: weareexporters.com, *.netlify.app y localhost.'
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': 'AVWRzrFvVKdXb9HhxI5W1eK6uyfH8ECX6JwF4DLkadrrc2WlQm7uvvxmnbiup6ir_LbbZZkLk8wLkP3p',
      }}
    >
      {hasValidRecaptchaKey ? (
        <GoogleReCaptchaProvider
          reCaptchaKey={RECAPTCHA_V3_SITE_KEY}
          language="es"
          scriptProps={{ async: true, defer: true }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <MainContent
                  onLoginClick={handleLoginClick}
                  onRegisterClick={handleRegisterClick}
                  onSwitchToLogin={handleSwitchToLogin}
                  onSwitchToRegister={handleSwitchToRegister}
                  isLoginModalOpen={isLoginModalOpen}
                  isRegisterModalOpen={isRegisterModalOpen}
                  isSubscriptionModalOpen={isSubscriptionModalOpen}
                  handleCloseModals={handleCloseModals}
                  handleSelectPlan={handleSelectPlan}
                />
              }
            />
            <Route path="/premiumdashboard" element={<PremiumDashboard />} />
          </Routes>
        </GoogleReCaptchaProvider>
      ) : (
        // Fallback sin provider (la UI funciona y tu RegisterModal mostrará error si intenta ejecutar el captcha)
        <Routes>
          <Route
            path="/"
            element={
              <MainContent
                onLoginClick={handleLoginClick}
                onRegisterClick={handleRegisterClick}
                onSwitchToLogin={handleSwitchToLogin}
                onSwitchToRegister={handleSwitchToRegister}
                isLoginModalOpen={isLoginModalOpen}
                isRegisterModalOpen={isRegisterModalOpen}
                isSubscriptionModalOpen={isSubscriptionModalOpen}
                handleCloseModals={handleCloseModals}
                handleSelectPlan={handleSelectPlan}
              />
            }
          />
          <Route path="/premiumdashboard" element={<PremiumDashboard />} />
        </Routes>
      )}
    </PayPalScriptProvider>
  );
};

export default App;
