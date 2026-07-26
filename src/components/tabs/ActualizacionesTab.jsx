import React, { useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Button, Card, Badge, Input, Select, Alert, Loader, EmptyState } from '../ui';

const AI_UPDATES_ENDPOINT =
  process.env.REACT_APP_AI_UPDATES_ENDPOINT ||
  'https://eaxaxvnfllukoflzuxcq.supabase.co/functions/v1/ai-updates';

const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const downloadCSV = (rows, filename) => {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv =
    headers.map(csvEscape).join(',') + '\n' +
    rows.map(r => headers.map(h => csvEscape(r[h])).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};

const ResultCard = ({ badge, title, emptyText, children }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <Badge variant="success">{badge}</Badge>
        <h4 className="text-lg font-extrabold text-gray-900 mt-3">
          {title}
        </h4>
      </div>
    </div>

    {children || (
      <p className="text-sm text-gray-500">
        {emptyText}
      </p>
    )}
  </Card>
);

const ActualizacionesTab = () => {
  const [sector, setSector] = useState('');
  const [focusCountry, setFocusCountry] = useState('');
  const [horizon, setHorizon] = useState(6);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState('');
  const [aiData, setAiData] = useState({
    trends: [],
    regulations: [],
    demand_signals: [],
    opportunities: [],
    sources: [],
  });

  const callAiUpdates = useCallback(async (payload) => {
    const { data: sess } = await supabase.auth.getSession();
    const jwt = sess?.session?.access_token;

    const res = await fetch(AI_UPDATES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json = {};

    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      throw new Error(json?.error || text || `HTTP ${res.status}`);
    }

    return json;
  }, []);

  const handleBriefing = useCallback(async () => {
    setAiErr('');
    setAiData({
      trends: [],
      regulations: [],
      demand_signals: [],
      opportunities: [],
      sources: [],
    });

    const s = String(sector || '').trim();

    if (!s) {
      setAiErr('Indica un sector o fracción HS.');
      return;
    }

    try {
      setAiLoading(true);

      const out = await callAiUpdates({
        sector: s,
        focus_country: String(focusCountry || '').trim(),
        horizon_months: Number(horizon) || 6,
      });

      setAiData({
        trends: Array.isArray(out?.trends) ? out.trends : [],
        regulations: Array.isArray(out?.regulations) ? out.regulations : [],
        demand_signals: Array.isArray(out?.demand_signals) ? out.demand_signals : [],
        opportunities: Array.isArray(out?.opportunities) ? out.opportunities : [],
        sources: Array.isArray(out?.sources) ? out.sources : [],
      });
    } catch (e) {
      setAiErr(e.message || 'Error al consultar IA.');
    } finally {
      setAiLoading(false);
    }
  }, [sector, focusCountry, horizon, callAiUpdates]);

  const exportAiCSV = useCallback(() => {
    const rows = [
      ...aiData.trends.map(t => ({ type: 'trend', ...t })),
      ...aiData.regulations.map(r => ({ type: 'regulation', ...r })),
      ...aiData.demand_signals.map(d => ({ type: 'demand_signal', ...d })),
      ...aiData.opportunities.map(o => ({ type: 'opportunity', ...o })),
    ];

    if (!rows.length) return;

    downloadCSV(rows, `briefing_IA_${(sector || 'sector').replace(/\s+/g, '_')}.csv`);
  }, [aiData, sector]);

  const hasResults =
    aiData.trends.length ||
    aiData.regulations.length ||
    aiData.demand_signals.length ||
    aiData.opportunities.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Actualizaciones IA</Badge>
                <span className="text-sm text-gray-500">
                  Tendencias, regulación y oportunidades
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Briefing inteligente de mercado
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Genera un resumen accionable por sector, fracción HS o país foco.
                Identifica tendencias, cambios regulatorios, señales de demanda y nuevas
                oportunidades de comercio internacional.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Horizonte actual</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-1">
              {horizon}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Meses de análisis configurados.
            </p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Exportable</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              CSV del briefing
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Descarga las señales generadas para análisis interno.
            </p>
          </Card>
        </div>
      </section>

      {/* Briefing */}
      <Card className="overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="success">Briefing IA</Badge>
                <span className="text-xs text-gray-400">
                  Mercado · Regulación · Demanda · Oportunidades
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900">
                Mercado & Regulación
              </h3>

              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Genera un resumen por sector o fracción HS con señales recientes y fuentes sugeridas.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={exportAiCSV}
              disabled={!hasResults}
              className="w-full lg:w-auto"
            >
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              label="Sector o HS"
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej. 08044010 o sector cacao"
            />

            <Input
              label="País foco"
              type="text"
              value={focusCountry}
              onChange={(e) => setFocusCountry(e.target.value)}
              placeholder="Ej. Estados Unidos"
            />

            <Select
              label="Horizonte"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
            >
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </Select>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Consejo de uso
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Prueba con HS de 8 dígitos o una búsqueda como “sector agro café”.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={handleBriefing}
              disabled={aiLoading}
              className="w-full sm:w-auto"
            >
              {aiLoading ? 'Consultando…' : 'Generar briefing IA'}
            </Button>
          </div>

          {aiErr && (
            <div className="mt-4">
              <Alert variant="danger">{aiErr}</Alert>
            </div>
          )}

          {aiLoading && (
            <div className="mt-5">
              <Loader text="Generando briefing de mercado…" />
            </div>
          )}

          {!aiLoading && !hasResults && !aiErr && (
            <div className="mt-6">
              <EmptyState
                title="Aún no hay briefing generado"
                description="Ingresa un sector o fracción HS y genera un resumen de tendencias, regulación, demanda y oportunidades."
              />
            </div>
          )}

          {hasResults ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ResultCard
                badge="Tendencias"
                title="Señales de mercado"
                emptyText="Sin señales destacadas."
              >
                {aiData.trends.length > 0 ? (
                  <ul className="space-y-4 text-sm text-gray-700">
                    {aiData.trends.map((t, i) => (
                      <li key={`t-${i}`} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <h5 className="font-extrabold text-gray-900">
                          {t.title}
                        </h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {t.summary}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {t.region ? `Región: ${t.region} · ` : ''}
                          Horizonte: {t.timeframe || '—'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ResultCard>

              <ResultCard
                badge="Regulación"
                title="Cambios normativos"
                emptyText="Sin cambios relevantes."
              >
                {aiData.regulations.length > 0 ? (
                  <ul className="space-y-4 text-sm text-gray-700">
                    {aiData.regulations.map((r, i) => (
                      <li key={`r-${i}`} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <h5 className="font-extrabold text-gray-900">
                          {r.jurisdiction}
                        </h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {r.change}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Vigencia: {r.effective_date || '—'}
                          {r.link ? ' · ' : ''}
                          {r.link && (
                            <a
                              className="text-green-700 underline"
                              href={r.link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              fuente
                            </a>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ResultCard>

              <ResultCard
                badge="Demanda"
                title="Señales de demanda"
                emptyText="Sin señales destacadas."
              >
                {aiData.demand_signals.length > 0 ? (
                  <ul className="space-y-4 text-sm text-gray-700">
                    {aiData.demand_signals.map((d, i) => (
                      <li key={`d-${i}`} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <h5 className="font-extrabold text-gray-900">
                          {d.market}
                        </h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {d.indicator}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Movimiento: {d.movement || '—'} · {d.note || ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ResultCard>

              <ResultCard
                badge="Oportunidades"
                title="Ideas accionables"
                emptyText="Sin propuestas inmediatas."
              >
                {aiData.opportunities.length > 0 ? (
                  <ul className="space-y-4 text-sm text-gray-700">
                    {aiData.opportunities.map((o, i) => (
                      <li key={`o-${i}`} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <h5 className="font-extrabold text-gray-900">
                          {o.idea}
                        </h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {o.rationale}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Sector: {o.sector || '—'} · Riesgo: {o.risk || '—'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ResultCard>

              {aiData.sources?.length > 0 && (
                <Card className="p-5 md:col-span-2 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="neutral">Fuentes sugeridas</Badge>
                    <span className="text-xs text-gray-400">
                      Revisa siempre fuentes oficiales antes de tomar decisiones.
                    </span>
                  </div>

                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {aiData.sources.map((s, i) => (
                      <li key={`src-${i}`}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </Card>

      {/* Email info */}
      <Card className="p-5 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
          <div className="h-12 w-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl">
            ✉️
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="success">Envío por correo</Badge>
              <span className="text-xs text-gray-400">
                Resumen mensual automático
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900">
              Actualizaciones mensuales
            </h3>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Se envía el primer día hábil de cada mes a tu correo registrado.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Incluye cambios normativos, mercados con mayor demanda y oportunidades por sector.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Si no lo ves, revisa spam o marca nuestro correo como seguro.</span>
              </li>
            </ul>

            <p className="mt-4 text-xs text-gray-500">
              Aquí encuentras noticias internacionales, con preferencias por categorías
              como agro, industria, servicios y países de interés.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActualizacionesTab;
