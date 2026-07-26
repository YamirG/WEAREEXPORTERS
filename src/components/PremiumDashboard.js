import React, { useState, useCallback } from 'react';

// 📌 Importar las pestañas
import ConsultasTab from './tabs/ConsultasTab';
import ProspeccionTab from './tabs/ProspeccionTab';
import CarteraTab from './tabs/CarteraTab';
import CapacitacionTab from './tabs/CapacitacionTab';
import AsesoriaTab from './tabs/AsesoriaTab';
import ActualizacionesTab from './tabs/ActualizacionesTab';
import SoporteTab from './tabs/SoporteTab';
import OnboardingTab from './tabs/OnboardingTab';
import TramitologiaTab from './tabs/TramitologiaTab';

import { Badge, Button } from './ui';

const PremiumDashboard = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [walletBalance, setWalletBalance] = useState(0);

  const [courseVideos, setCourseVideos] = useState([
    // Ejemplo opcional de arranque:
    // { id: 'ex1', title: 'De cero a exportador - Intro', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
  ]);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const toEmbedUrl = (raw = '') => {
    const url = raw.trim();
    if (!url) return '';

    const youtuMatch = url.match(/^https?:\/\/(www\.)?youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    if (youtuMatch) return `https://www.youtube.com/embed/${youtuMatch[2]}`;

    const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    if (/youtube\.com\/embed\//i.test(url)) return url;

    return url;
  };

  const handleAddVideo = () => {
    const title = newVideoTitle.trim();
    const url = toEmbedUrl(newVideoUrl);
    if (!title || !url) return;

    const newItem = {
      id: `vid-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      title,
      url,
    };

    setCourseVideos((prev) => [newItem, ...prev]);
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const handleGoTo = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const navItems = [
    { key: 'inicio', label: 'Inicio', icon: '⌂' },
    { key: 'consultas', label: 'Consultas', icon: '⌕' },
    { key: 'prospeccion', label: 'Prospección', icon: '✦' },
    { key: 'cartera', label: 'Cartera', icon: '◈' },
    { key: 'capacitacion', label: 'Capacitación', icon: '▣' },
    { key: 'asesoria', label: 'Asesoría', icon: '◌' },
    { key: 'tramitologia', label: 'Tramitología', icon: '▤' },
    { key: 'actualizaciones', label: 'Actualizaciones', icon: '↻' },
    { key: 'soporte', label: 'Soporte', icon: '?' },
  ];

  const activeLabel = navItems.find((item) => item.key === activeTab)?.label || 'Panel';

  const desktopNavClass = (tabKey) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
      activeTab === tabKey
        ? 'bg-[#045023] text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const mobileNavClass = (tabKey) =>
    `min-w-[74px] flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl text-[11px] font-semibold transition-all duration-200 ${
      activeTab === tabKey
        ? 'bg-green-100 text-green-700'
        : 'text-gray-500 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex w-[280px] shrink-0 border-r border-gray-200 bg-white fixed left-0 top-0 bottom-0 z-40">
          <div className="flex flex-col w-full p-5">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#045023] text-white flex items-center justify-center font-extrabold">
                  W
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
                    WeAreExporters
                  </p>
                  <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
                    Premium Panel
                  </h1>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-2" aria-label="Navegación principal">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={desktopNavClass(item.key)}
                >
                  <span className="h-9 w-9 rounded-xl bg-gray-100/80 text-current flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-3xl bg-green-50 border border-green-100 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                Saldo disponible
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                ${walletBalance.toFixed(2)}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-4"
                onClick={() => setActiveTab('cartera')}
              >
                Gestionar Cartera
              </Button>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 lg:ml-[280px]">
          {/* HEADER */}
          <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="success">Premium</Badge>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      Plataforma de exportación
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                    {activeLabel}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                    <p className="text-xs text-gray-500">Saldo</p>
                    <p className="text-sm font-extrabold text-green-700">
                      ${walletBalance.toFixed(2)}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('cartera')}
                    className="w-full sm:w-auto"
                  >
                    Gestionar Cartera
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => {
                      localStorage.setItem('isPremiumUser', 'false');
                      localStorage.setItem('queryCount', '0');
                      window.location.href = '/';
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'inicio' && (
                <OnboardingTab
                  onGoTo={handleGoTo}
                  routes={{
                    pais: 'consultas',
                    requisitos: 'consultas',
                    rentabilidad: 'consultas',
                    prospeccion: 'prospeccion',
                    tramite: 'tramitologia',
                  }}
                />
              )}

              {activeTab === 'consultas' && <ConsultasTab />}

              {activeTab === 'prospeccion' && (
                <ProspeccionTab
                  walletBalance={walletBalance}
                  setWalletBalance={setWalletBalance}
                />
              )}

              {activeTab === 'cartera' && (
                <CarteraTab
                  walletBalance={walletBalance}
                  setWalletBalance={setWalletBalance}
                />
              )}

              {activeTab === 'capacitacion' && (
                <CapacitacionTab
                  // videos={courseVideos}
                  // onAddVideo={handleAddVideo}
                  // newVideoTitle={newVideoTitle}
                  // newVideoUrl={newVideoUrl}
                  // setNewVideoTitle={setNewVideoTitle}
                  // setNewVideoUrl={setNewVideoUrl}
                />
              )}

              {activeTab === 'asesoria' && <AsesoriaTab />}

              {activeTab === 'tramitologia' && <TramitologiaTab />}

              {activeTab === 'actualizaciones' && <ActualizacionesTab />}

              {activeTab === 'soporte' && <SoporteTab />}
            </div>
          </main>
        </div>
      </div>

      {/* BOTTOM NAV MOBILE */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-3 py-2">
        <div className="overflow-x-auto">
          <ul className="flex gap-2 min-w-max">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={mobileNavClass(item.key)}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PremiumDashboard;
