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

const PremiumDashboard = () => {
  // ⬇️ Arrancamos en "inicio" para guiar al usuario
  const [activeTab, setActiveTab] = useState('inicio');
  const [walletBalance, setWalletBalance] = useState(0);

  // 👇 Estado para la pestaña de Capacitación (evita undefined)
  const [courseVideos, setCourseVideos] = useState([
    // Ejemplo opcional de arranque:
    // { id: 'ex1', title: 'De cero a exportador - Intro', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
  ]);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Normaliza enlaces de YouTube a formato embed
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

  // 👇 Permite que OnboardingTab cambie de pestaña
  const handleGoTo = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const tabButtonClass = (tabKey) =>
    `whitespace-nowrap px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base transition-colors ${
      activeTab === tabKey
        ? 'bg-green-100 text-green-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 md:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Título */}
            <div className="text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl md:text-2xl font-bold leading-tight">
                Panel Premium de WeAreExporters
              </h1>
            </div>

            {/* Saldo + acciones */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center justify-center lg:justify-end gap-2 sm:gap-3">
              <div className="text-center sm:text-left text-sm sm:text-base md:text-lg font-medium bg-white/10 px-3 py-2 rounded-lg">
                Saldo: ${walletBalance.toFixed(2)}
              </div>

              <button
                onClick={() => setActiveTab('cartera')}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base font-medium"
              >
                Gestionar Cartera
              </button>

              <button
                onClick={() => {
                  localStorage.setItem('isPremiumUser', 'false');
                  localStorage.setItem('queryCount', '0');
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base font-medium"
              >
                Cerrar Sesión Premium
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          {/* Móvil: scroll horizontal limpio */}
          <div className="md:hidden overflow-x-auto">
            <ul className="flex gap-2 min-w-max">
              <li>
                <button onClick={() => setActiveTab('inicio')} className={tabButtonClass('inicio')}>
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('consultas')} className={tabButtonClass('consultas')}>
                  Consultas
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('prospeccion')} className={tabButtonClass('prospeccion')}>
                  Prospección Masiva
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('cartera')} className={tabButtonClass('cartera')}>
                  Cartera Digital
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('capacitacion')} className={tabButtonClass('capacitacion')}>
                  Capacitación
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('asesoria')} className={tabButtonClass('asesoria')}>
                  Asesoría
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tramitologia')} className={tabButtonClass('tramitologia')}>
                  Tramitología
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('actualizaciones')} className={tabButtonClass('actualizaciones')}>
                  Actualizaciones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('soporte')} className={tabButtonClass('soporte')}>
                  Soporte
                </button>
              </li>
            </ul>
          </div>

          {/* Escritorio: wrap limpio con gap */}
          <div className="hidden md:block">
            <ul className="flex flex-wrap items-center justify-start gap-3">
              <li>
                <button onClick={() => setActiveTab('inicio')} className={tabButtonClass('inicio')}>
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('consultas')} className={tabButtonClass('consultas')}>
                  Consultas
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('prospeccion')} className={tabButtonClass('prospeccion')}>
                  Prospección Masiva
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('cartera')} className={tabButtonClass('cartera')}>
                  Cartera Digital
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('capacitacion')} className={tabButtonClass('capacitacion')}>
                  Capacitación
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('asesoria')} className={tabButtonClass('asesoria')}>
                  Asesoría
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tramitologia')} className={tabButtonClass('tramitologia')}>
                  Tramitología
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('actualizaciones')} className={tabButtonClass('actualizaciones')}>
                  Actualizaciones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('soporte')} className={tabButtonClass('soporte')}>
                  Soporte
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="container mx-auto p-4 md:p-6">
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
    </div>
  );
};

export default PremiumDashboard;
