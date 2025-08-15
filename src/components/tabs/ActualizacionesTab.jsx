import React, { useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const AI_UPDATES_ENDPOINT =
  process.env.REACT_APP_AI_UPDATES_ENDPOINT ||
  'https://eaxaxvnfllukoflzuxcq.supabase.co/functions/v1/ai-updates';

// ===== UI utils =====
const Card = ({ title, subtitle, children, icon, footer }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    {(title || subtitle) && (
      <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        {icon && <div className="text-green-600 mt-0.5">{icon}</div>}
        <div>
          <div className="text-base md:text-lg font-semibold text-gray-800">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
    )}
    <div className="p-4 md:p-5">{children}</div>
    {footer && <div className="px-4 md:px-5 py-3 border-t border-gray-100">{footer}</div>}
  </div>
);

const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const downloadCSV = (rows, filename) => {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv =
    headers.map(csvEscape).join(',') + '\n' +
    rows.map(r => headers.map(h => csvEscape(r[h])).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const ActualizacionesTab = () => {
  // ====== Panel IA de Tendencias/Regulaciones/Demanda/Oportunidades ======
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
    sources: []
  });

  const callAiUpdates = useCallback(async (payload) => {
    const { data: sess } = await supabase.auth.getSession();
    const jwt = sess?.session?.access_token;

    const res = await fetch(AI_UPDATES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch {}
    if (!res.ok) {
      throw new Error(json?.error || text || `HTTP ${res.status}`);
    }
    return json;
  }, []);

  const handleBriefing = useCallback(async () => {
    setAiErr('');
    setAiData({ trends: [], regulations: [], demand_signals: [], opportunities: [], sources: [] });

    const s = String(sector || '').trim();
    if (!s) { setAiErr('Indica un sector o fracción HS.'); return; }

    try {
      setAiLoading(true);
      const out = await callAiUpdates({
        sector: s,
        focus_country: String(focusCountry || '').trim(),
        horizon_months: Number(horizon) || 6
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

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Actualizaciones Mensuales</h2>
        <p className="text-emerald-50 mt-1">
          Tendencias, regulaciones y oportunidades clave del comercio internacional. Recibirás un resumen mensual directo a tu correo.
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* ==== Briefing IA ==== */}
        <Card
          title="Briefing IA de Mercado & Regulación"
          subtitle="Genera un resumen por sector o fracción HS con señales recientes."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">🤖</span>}
          footer={
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Consejo: prueba con HS (8 dígitos) o “sector agro (café)”.</span>
              <button
                onClick={exportAiCSV}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                disabled={
                  !(
                    aiData.trends.length ||
                    aiData.regulations.length ||
                    aiData.demand_signals.length ||
                    aiData.opportunities.length
                  )
                }
              >
                Exportar CSV
              </button>
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Sector o HS</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ej. 08044010 o “sector cacao”"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">País foco (opcional)</label>
              <input
                type="text"
                value={focusCountry}
                onChange={(e) => setFocusCountry(e.target.value)}
                placeholder="Ej. Estados Unidos"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Horizonte</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleBriefing}
              className="h-[42px] px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              disabled={aiLoading}
            >
              {aiLoading ? 'Consultando…' : 'Generar briefing IA'}
            </button>
            {aiErr && <div className="text-xs text-red-600 mt-2">{aiErr}</div>}
          </div>

          {/* Resultados */}
          {(aiData.trends.length + aiData.regulations.length + aiData.demand_signals.length + aiData.opportunities.length > 0) ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg border border-gray-100">
                <div className="font-semibold text-gray-800 mb-2">Tendencias</div>
                {aiData.trends.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin señales destacadas.</div>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {aiData.trends.map((t, i) => (
                      <li key={`t-${i}`}>
                        <div className="font-medium text-gray-800">{t.title}</div>
                        <div className="text-gray-600">{t.summary}</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {t.region ? `Región: ${t.region} · ` : ''}Horizonte: {t.timeframe || '—'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 rounded-lg border border-gray-100">
                <div className="font-semibold text-gray-800 mb-2">Regulaciones</div>
                {aiData.regulations.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin cambios relevantes.</div>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {aiData.regulations.map((r, i) => (
                      <li key={`r-${i}`}>
                        <div className="font-medium text-gray-800">{r.jurisdiction}</div>
                        <div className="text-gray-600">{r.change}</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          Vigencia: {r.effective_date || '—'} {r.link ? ' · ' : ''}
                          {r.link && (
                            <a className="text-emerald-700 underline" href={r.link} target="_blank" rel="noreferrer">
                              fuente
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 rounded-lg border border-gray-100">
                <div className="font-semibold text-gray-800 mb-2">Señales de demanda</div>
                {aiData.demand_signals.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin señales destacadas.</div>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {aiData.demand_signals.map((d, i) => (
                      <li key={`d-${i}`}>
                        <div className="font-medium text-gray-800">{d.market}</div>
                        <div className="text-gray-600">{d.indicator}</div>
                        <div className="text-[11px] text-gray-400 mt-1">Movimiento: {d.movement || '—'} · {d.note || ''}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 rounded-lg border border-gray-100">
                <div className="font-semibold text-gray-800 mb-2">Oportunidades</div>
                {aiData.opportunities.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin propuestas inmediatas.</div>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {aiData.opportunities.map((o, i) => (
                      <li key={`o-${i}`}>
                        <div className="font-medium text-gray-800">{o.idea}</div>
                        <div className="text-gray-600">{o.rationale}</div>
                        <div className="text-[11px] text-gray-400 mt-1">Sector: {o.sector || '—'} · Riesgo: {o.risk || '—'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {aiData.sources?.length > 0 && (
                <div className="md:col-span-2 p-3 rounded-lg border border-gray-100">
                  <div className="font-semibold text-gray-800 mb-2">Fuentes sugeridas</div>
                  <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                    {aiData.sources.map((s, i) => <li key={`src-${i}`}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            !aiLoading && <div className="text-sm text-gray-500 mt-3">Genera un briefing para ver resultados aquí.</div>
          )}
        </Card>

        {/* Info correo */}
        <Card
          title="Envío por correo"
          subtitle="Recibirás el resumen mensual automáticamente."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">✉️</span>}
        >
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Se envía el primer día hábil de cada mes a tu correo registrado.</li>
            <li>Incluye cambios normativos, mercados con mayor demanda y oportunidades por sector.</li>
            <li>Si no lo ves, revisa spam o marca nuestro correo como seguro.</li>
          </ul>
          <div className="mt-4 text-xs text-gray-500">
            Aqui encuentras Noticias Internacionales, con preferencias por categorías (agro, industria, servicios) y países de interés.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ActualizacionesTab;


