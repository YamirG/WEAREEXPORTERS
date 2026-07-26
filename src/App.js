// src/App.js
import React, { useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import NavbarHeader from "./components/NavbarHeader";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import PricingSection from "./components/PricingSection";
import FaqSection from "./components/FaqSection";
import FooterSection from "./components/FooterSection";

import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import SubscriptionModal from "./components/SubscriptionModal";
import PremiumDashboard from "./components/PremiumDashboard";

import LandingWeAreExporters from "./pages/LandingWeAreExporters";
import LandingDiagnosticoExportador from "./pages/LandingDiagnosticoExportador";

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
  const [, setCurrentView] = useState("home");

  const handleGetStarted = () => {
    setCurrentView("home");

    document
      .getElementById("pricing")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarHeader
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      <main>
        <HeroSection
          onGetStarted={handleGetStarted}
        />

        <FeaturesSection />

        <PricingSection
          onOpenRegister={onRegisterClick}
        />
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

// AppRoutes está separado para utilizar useNavigate
// dentro de AppInner sin agregar otro BrowserRouter.
const AppRoutes = ({
  isLoginModalOpen,
  isRegisterModalOpen,
  isSubscriptionModalOpen,
  handleLoginClick,
  handleRegisterClick,
  handleSwitchToLogin,
  handleSwitchToRegister,
  handleCloseModals,
  handleSelectPlan,
}) => {
  return (
    <Routes>
      {/* Página principal */}
      <Route
        path="/"
        element={
          <MainContent
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onSwitchToLogin={handleSwitchToLogin}
            onSwitchToRegister={
              handleSwitchToRegister
            }
            isLoginModalOpen={isLoginModalOpen}
            isRegisterModalOpen={
              isRegisterModalOpen
            }
            isSubscriptionModalOpen={
              isSubscriptionModalOpen
            }
            handleCloseModals={
              handleCloseModals
            }
            handleSelectPlan={handleSelectPlan}
          />
        }
      />

      {/* Panel Premium */}
      <Route
        path="/premiumdashboard"
        element={<PremiumDashboard />}
      />

      {/* Landing corporativa */}
      <Route
        path="/lp/weareexporters"
        element={<LandingWeAreExporters />}
      />

      {/*
        Ruta anterior del diagnóstico.
        Se conserva para no romper enlaces existentes.
      */}
      <Route
        path="/lp/diagnostico-exportador"
        element={
          <LandingDiagnosticoExportador />
        }
      />

      {/*
        Nueva ruta corta recomendada para publicidad,
        redes sociales y comunicación comercial.
      */}
      <Route
        path="/diagnostico"
        element={
          <LandingDiagnosticoExportador />
        }
      />
    </Routes>
  );
};

const AppInner = () => {
  const navigate = useNavigate();

  const [
    isLoginModalOpen,
    setIsLoginModalOpen,
  ] = useState(false);

  const [
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  ] = useState(false);

  const [
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
  ] = useState(false);

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
    if (planName === "Gratuito") {
      localStorage.setItem("queryCount", "0");
      localStorage.setItem(
        "isPremiumUser",
        "false"
      );

      handleRegisterClick();
      return;
    }

    if (planName === "Premium") {
      localStorage.setItem(
        "isPremiumUser",
        "true"
      );

      localStorage.setItem("queryCount", "0");

      handleCloseModals();
      navigate("/premiumdashboard");
      return;
    }

    handleCloseModals();

    document
      .getElementById("pricing")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <AppRoutes
      isLoginModalOpen={isLoginModalOpen}
      isRegisterModalOpen={
        isRegisterModalOpen
      }
      isSubscriptionModalOpen={
        isSubscriptionModalOpen
      }
      handleLoginClick={handleLoginClick}
      handleRegisterClick={handleRegisterClick}
      handleSwitchToLogin={handleSwitchToLogin}
      handleSwitchToRegister={
        handleSwitchToRegister
      }
      handleCloseModals={handleCloseModals}
      handleSelectPlan={handleSelectPlan}
    />
  );
};

const App = () => {
  const RECAPTCHA_V3_SITE_KEY =
    process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY ||
    process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
    "";

  const hasValidRecaptchaKey =
    typeof RECAPTCHA_V3_SITE_KEY === "string" &&
    RECAPTCHA_V3_SITE_KEY.length > 30;

  if (!hasValidRecaptchaKey) {
    console.warn(
      "[reCAPTCHA v3] Site key ausente o inválida. " +
        "Define REACT_APP_RECAPTCHA_V3_SITE_KEY " +
        "en tu entorno (Netlify/Local)."
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          process.env
            .REACT_APP_PAYPAL_CLIENT_ID ||
          "AVWRzrFvVKdXb9HhxI5W1eK6uyfH8ECX6JwF4DLkadrrc2WlQm7uvvxmnbiup6ir_LbbZZkLk8wLkP3p",
      }}
    >
      {hasValidRecaptchaKey ? (
        <GoogleReCaptchaProvider
          reCaptchaKey={
            RECAPTCHA_V3_SITE_KEY
          }
          language="es"
          scriptProps={{
            async: true,
            defer: true,
          }}
        >
          <AppInner />
        </GoogleReCaptchaProvider>
      ) : (
        <AppInner />
      )}
    </PayPalScriptProvider>
  );
};

export default App;
