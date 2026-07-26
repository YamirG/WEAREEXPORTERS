import React from 'react';
import ExportarFlow from '../tramitologia/ExportarFlow';
import { Card, Badge } from '../ui';

export default function TramitologiaTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Exportar · Activo</Badge>
                <span className="text-sm text-gray-500">
                  Gestión documental y guías oficiales
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Tramitología
              </h1>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Genera tu guía paso a paso para realizar tus trámites de exportación.
                Simplifica el proceso y, si prefieres aprender desde cero, también puedes
                apoyarte en la sección de <span className="font-semibold text-gray-900">Capacitación</span>.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Flujo disponible</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-1">Exportar</h3>
            <p className="text-sm text-gray-500 mt-1">
              Guías paso a paso para salir del país de origen.
            </p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Incluye</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              PDF + fuentes oficiales
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Descarga una guía con requisitos, pasos, enlaces y manual oficial.
            </p>
          </Card>
        </div>
      </section>

      {/* Tabs visuales */}
      <Card className="p-4 md:p-5">
        <nav
          className="flex flex-col sm:flex-row gap-2 sm:gap-3"
          role="tablist"
          aria-label="Flujos de Tramitología"
        >
          <button
            role="tab"
            aria-selected="true"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-green-100 text-green-700 font-semibold text-sm md:text-base cursor-default"
            disabled
          >
            Exportar (activo)
          </button>

          <button
            role="tab"
            aria-selected="false"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm md:text-base cursor-not-allowed"
            disabled
            title="Próximamente"
          >
            Importar (próximamente)
          </button>
        </nav>
      </Card>

      {/* Contenido */}
      <section aria-labelledby="exportar-title">
        <Card className="p-5 md:p-6">
          <div className="mb-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="success">Flujo Exportar</Badge>
              <span className="text-xs text-gray-400">
                País de origen · HS Code · Tipo de trámite
              </span>
            </div>

            <h2
              id="exportar-title"
              className="text-2xl font-extrabold text-gray-900"
            >
              Generador de guía
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">
              Selecciona el país de origen, el producto o HS Code y el tipo de trámite
              para generar tu guía automáticamente.
            </p>
          </div>

          <ExportarFlow />
        </Card>
      </section>
    </div>
  );
}
