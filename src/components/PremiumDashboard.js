import React, { useState } from 'react';

// 📌 Importar las pestañas
import ConsultasTab from './tabs/ConsultasTab';
import ProspeccionTab from './tabs/ProspeccionTab';
import CarteraTab from './tabs/CarteraTab';
import CapacitacionTab from './tabs/CapacitacionTab';
import AsesoriaTab from './tabs/AsesoriaTab';
import ActualizacionesTab from './tabs/ActualizacionesTab';
import SoporteTab from './tabs/SoporteTab';

const PremiumDashboard = () => {
  const [activeTab, setActiveTab] = useState('consultas');
  const [walletBalance, setWalletBalance] = useState(0);
    // 👇 Estado para la pestaña de Capacitación (evita undefined)
  const [courseVideos, setCourseVideos] = useState([
    // Ejemplo opcional de arranque (puedes dejarlo vacío []):
    // { id: 'ex1', title: 'De cero a exportador - Intro', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
  ]);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Normaliza enlaces de YouTube a formato embed
  const toEmbedUrl = (raw = '') => {
    const url = raw.trim();
    if (!url) return '';

    // youtu.be/VIDEOID -> embed/VIDEOID
    const youtuMatch = url.match(/^https?:\/\/(www\.)?youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    if (youtuMatch) return `https://www.youtube.com/embed/${youtuMatch[2]}`;

    // youtube.com/watch?v=VIDEOID -> embed/VIDEOID
    const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // Si ya viene en /embed/ lo dejamos igual
    if (/youtube\.com\/embed\//i.test(url)) return url;

    // Si no es YouTube, lo dejamos tal cual (por si usas otro proveedor que soporte iframes)
    
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">
            Panel Premium de WeAreExporters
          </h1>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <span className="text-base md:text-lg">
              Saldo: ${walletBalance.toFixed(2)}
            </span>
            <button
              onClick={() => setActiveTab('cartera')}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Gestionar Cartera
            </button>
            <button
              onClick={() => {
                localStorage.setItem('isPremiumUser', 'false');
                localStorage.setItem('queryCount', '0');
                window.location.href = '/';
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Cerrar Sesión Premium
            </button>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <ul className="flex flex-wrap justify-center md:justify-start space-x-2 md:space-x-6">
            <li>
              <button
                onClick={() => setActiveTab('consultas')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'consultas'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Consultas
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('prospeccion')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'prospeccion'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Prospección Masiva
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('cartera')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'cartera'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cartera Digital
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('capacitacion')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'capacitacion'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Capacitación
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('asesoria')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'asesoria'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Asesoría
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('actualizaciones')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'actualizaciones'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Actualizaciones
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('soporte')}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base ${
                  activeTab === 'soporte'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Soporte
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="container mx-auto p-4 md:p-6">
        {activeTab === 'consultas' && <ConsultasTab />}
        {activeTab === 'prospeccion' && (
          <ProspeccionTab walletBalance={walletBalance} setWalletBalance={setWalletBalance} />
        )}
        {activeTab === 'cartera' && (
          <CarteraTab walletBalance={walletBalance} setWalletBalance={setWalletBalance} />
        )}
        {activeTab === 'capacitacion' && <CapacitacionTab />}
        {activeTab === 'asesoria' && <AsesoriaTab />}
        {activeTab === 'actualizaciones' && <ActualizacionesTab />}
        {activeTab === 'soporte' && <SoporteTab />}
      </div>
    </div>
  );
};

export default PremiumDashboard;
