import React from 'react';
import { Button, Card, Badge } from '../ui';

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
    <article className="space-y-5">
      <Card className="overflow-hidden">
        <header className="p-5 md:p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="success">Guía generada</Badge>
                <span className="text-xs text-gray-400">Lista para descarga PDF</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {title}
              </h3>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                País: <strong>{country}</strong> · Trámite: <strong>{procedureLabel}</strong>
                {hsCode ? (
                  <>
                    {' '}· HS/Producto: <strong>{hsCode}</strong>
                  </>
                ) : null}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={onDownloadPdf}
              disabled={!manual}
              className="w-full lg:w-auto"
            >
              Descargar PDF
            </Button>
          </div>
        </header>

        <div className="p-5 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-5">
          <aside className="xl:col-span-4 space-y-5">
            <Card className="p-5">
              <h4 className="font-extrabold text-gray-900 mb-3">Requisitos</h4>

              <ul className="space-y-2 text-sm text-gray-700">
                {requirements.length > 0 ? (
                  requirements.map((r, i) => (
                    <li key={`req-${i}`} className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{typeof r === 'string' ? r : r?.label || 'Requisito no especificado'}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No disponibles (demo)</li>
                )}
              </ul>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              <Card className="p-5">
                <p className="text-xs text-gray-500">Autoridad</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{authority}</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs text-gray-500">Tiempos estimados</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{sla}</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs text-gray-500">Costos</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{fees}</p>
              </Card>
            </div>

            {officialManual && (
              <Card className="p-5 bg-green-50 border-green-100">
                <Badge variant="success">Fuente oficial</Badge>

                <h4 className="font-extrabold text-green-800 mt-3">
                  Guía oficial de usuario
                </h4>

                <p className="text-sm text-gray-700 mt-2">
                  <strong>{officialManual.label || 'Manual oficial'}</strong>
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Dependencia: {officialManual.agency || '—'}
                </p>

                {officialManual.notes ? (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {officialManual.notes}
                  </p>
                ) : null}

                {officialManual.url ? (
                  <a
                    href={officialManual.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex mt-4 text-sm font-semibold text-green-700 underline break-all"
                  >
                    Abrir guía oficial →
                  </a>
                ) : null}
              </Card>
            )}
          </aside>

          <section className="xl:col-span-8 space-y-5">
            <Card className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h4 className="text-xl font-extrabold text-gray-900">
                    Pasos del trámite
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Sigue esta secuencia para avanzar de forma ordenada.
                  </p>
                </div>

                <Badge variant="neutral">{steps.length || 0} pasos</Badge>
              </div>

              <div className="space-y-4">
                {steps.length > 0 ? (
                  steps.map((s, i) => (
                    <div
                      key={`step-${i}`}
                      className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-extrabold">
                        {i + 1}
                      </div>

                      <div>
                        <h5 className="font-extrabold text-gray-900">
                          {s?.title || `Paso ${i + 1}`}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {s?.detail || 'Detalle no disponible'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Sin pasos disponibles (demo)</p>
                )}
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-xl font-extrabold text-gray-900">
                    Enlaces oficiales
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Consulta siempre la fuente oficial antes de presentar el trámite.
                  </p>
                </div>

                <Badge variant="neutral">{links.length || 0} enlaces</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {links.length > 0 ? (
                  links.map((l, i) => (
                    <a
                      key={`link-${i}`}
                      href={l?.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition p-4"
                    >
                      <p className="text-sm font-bold text-gray-900">
                        {l?.label || 'Enlace oficial'}
                      </p>
                      <p className="text-xs text-green-700 underline break-all mt-1">
                        {l?.url || '#'}
                      </p>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Sin enlaces disponibles</p>
                )}
              </div>
            </Card>
          </section>
        </div>
      </Card>
    </article>
  );
}
