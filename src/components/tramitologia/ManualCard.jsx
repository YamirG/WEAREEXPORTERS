import React from 'react';

export default function ManualCard({ manual, onDownloadPdf }) {
  const safeManual = manual || {};

  const title = safeManual.title || 'Guía de Trámite';
  const country = safeManual.country || '—';
  const procedureLabel = safeManual.procedureLabel || '—';
  const hsCode = safeManual.hsCode || '';
  const authority = safeManual.authority || '—';
  const sla = safeManual.sla || '—';
  const fees = safeManual.fees || '—';
  const officialManual = safeManual.officialManual || null;

  const requirements = Array.isArray(safeManual.requirements) ? safeManual.requirements : [];
  const steps = Array.isArray(safeManual.steps) ? safeManual.steps : [];
  const links = Array.isArray(safeManual.links) ? safeManual.links : [];

  return (
    <article className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      <header className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-900">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          País: <strong>{country}</strong> · Trámite: <strong>{procedureLabel}</strong>
          {hsCode ? (
            <>
              {' '}· HS/Producto: <strong>{hsCode}</strong>
            </>
          ) : null}
        </p>
      </header>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        <section className="md:col-span-1">
          <h4 className="font-bold text-gray-900 mb-2">Requisitos</h4>

          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {requirements.length > 0 ? (
              requirements.map((r, i) => (
                <li key={`req-${i}`}>
                  {typeof r === 'string' ? r : r?.label || 'Requisito no especificado'}
                </li>
              ))
            ) : (
              <li>No disponibles (demo)</li>
            )}
          </ul>

          <div className="mt-4">
            <h4 className="font-bold text-gray-900 mb-1">Autoridad</h4>
            <p className="text-sm text-gray-700">{authority}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Tiempos</h4>
              <p className="text-sm text-gray-700">{sla}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Costos</h4>
              <p className="text-sm text-gray-700">{fees}</p>
            </div>
          </div>

          {officialManual && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
              <h4 className="font-bold text-green-800 mb-1">Guía oficial de usuario</h4>
              <p className="text-sm text-gray-700">
                <strong>{officialManual.label || 'Manual oficial'}</strong>
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Dependencia: {officialManual.agency || '—'}
              </p>
              {officialManual.notes ? (
                <p className="text-sm text-gray-600 mt-1">{officialManual.notes}</p>
              ) : null}
              {officialManual.url ? (
                <a
                  href={officialManual.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-sm font-medium text-green-700 underline break-all"
                >
                  Abrir guía oficial
                </a>
              ) : null}
            </div>
          )}
        </section>

        <section className="md:col-span-2">
          <h4 className="font-bold text-gray-900 mb-2">Pasos</h4>

          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
            {steps.length > 0 ? (
              steps.map((s, i) => (
                <li key={`step-${i}`}>
                  <span className="font-semibold">
                    {s?.title || `Paso ${i + 1}`}:
                  </span>{' '}
                  <span>{s?.detail || 'Detalle no disponible'}</span>
                </li>
              ))
            ) : (
              <li>Sin pasos disponibles (demo)</li>
            )}
          </ol>

          <div className="mt-4">
            <h4 className="font-bold text-gray-900 mb-2">Enlaces oficiales</h4>

            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              {links.length > 0 ? (
                links.map((l, i) => (
                  <li key={`link-${i}`}>
                    <a
                      href={l?.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="underline break-all"
                    >
                      {l?.label || l?.url || 'Enlace oficial'}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-gray-700">Sin enlaces disponibles</li>
              )}
            </ul>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={!manual}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm md:text-base bg-green-100 text-green-700 hover:bg-green-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Descargar PDF

              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M8 12l4 4 4-4M12 16V4"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 20H4"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </article>
  );
}
