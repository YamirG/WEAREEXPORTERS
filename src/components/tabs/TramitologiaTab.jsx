import React from 'react';
import ExportarFlow from '../tramitologia/ExportarFlow';

export default function TramitologiaTab() {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
      {/* Header principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-5 md:mb-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                Tramitología
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-green-50 mt-2 max-w-3xl leading-relaxed">
                Genera tu guía paso a paso para realizar tu(s) trámite(s) de exportar.
                En esta sección simplificas el proceso pero también si lo prefieres puedes aprender desde cero en la sección de{' '}
                <span className="font-semibold text-white">Capacitación</span>.
              </p>
            </div>

            {/* Badge visual */}
            <div className="self-start md:self-center">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                Exportar · Activo
              </span>
            </div>
          </div>
        </div>

        {/* Tabs visuales */}
        <div className="px-4 sm:px-5 md:px-6 py-4 bg-gray-50 border-t border-white/10">
          <nav
            className="flex flex-col sm:flex-row gap-2 sm:gap-3"
            role="tablist"
            aria-label="Flujos de Tramitología"
          >
            <button
              role="tab"
              aria-selected="true"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#045023] text-white font-semibold shadow-sm text-sm md:text-base cursor-default"
              disabled
            >
              Exportar (activo)
            </button>

            <button
              role="tab"
              aria-selected="false"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-200 text-gray-500 font-semibold text-sm md:text-base cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Importar (próximamente)
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido */}
      <section
        aria-labelledby="exportar-title"
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6"
      >
        <div className="mb-4 md:mb-5">
          <h2
            id="exportar-title"
            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900"
          >
            Flujo Exportar
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">
            Selecciona el país de origen, el producto o HS Code y el tipo de trámite para generar tu guía automáticamente.
          </p>
        </div>

        <ExportarFlow />
      </section>
    </div>
  );
}
