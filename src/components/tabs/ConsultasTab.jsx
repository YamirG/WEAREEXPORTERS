import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

// (opcional) si quieres sobreescribir por .env:
// REACT_APP_AI_CONSULTAS_ENDPOINT=https://TU-PROYECTO.supabase.co/functions/v1/ai-consultas
const AI_CONSULTAS_ENDPOINT =
  process.env.REACT_APP_AI_CONSULTAS_ENDPOINT ||
  'https://eaxaxvnfllukoflzuxcq.supabase.co/functions/v1/ai-consultas';

const COUNTRY_LIST = [
  'México','Estados Unidos','Canadá','Brasil','Argentina','Chile','Colombia','Perú','Uruguay','Paraguay','Bolivia','Ecuador',
  'Costa Rica','Panamá','Guatemala','Honduras','El Salvador','Nicaragua','República Dominicana',
  'España','Francia','Alemania','Italia','Reino Unido','Países Bajos','Bélgica','Portugal','Suecia','Noruega','Dinamarca','Irlanda','Suiza',
  'China','Japón','Corea del Sur','India','Singapur','Tailandia','Vietnam','Indonesia','Malasia','Filipinas',
  'Australia','Nueva Zelanda',
  'Emiratos Árabes Unidos','Arabia Saudita','Qatar','Kuwait','Turquía','Israel','Sudáfrica','Egipto','Marruecos'
];

const isHSLike = (s) => /^\d{6,10}$/.test(String(s || '').trim());
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

// Spinner minimalista
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-600" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

// Botón consistente
const Button = ({ children, className = '', ...props }) => (
  <button
    className={
      'h-[42px] inline-flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-colors ' +
      'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ' +
      className
    }
    {...props}
  >
    {children}
  </button>
);

// Botón secundario
const ButtonSecondary = ({ children, className = '', ...props }) => (
  <button
    className={
      'h-[42px] inline-flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-colors ' +
      'bg-gray-100 hover:bg-gray-200 text-gray-800 ' +
      className
    }
    {...props}
  >
    {children}
  </button>
);

// Tarjeta contenedora
const Card = ({ title, subtitle, children, icon }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100">
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
  </div>
);

const ConsultasTab = () => {
  // --- Acceso premium ---
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id || null;
        if (!uid) {
          setIsPremium(false);
          return;
        }
        const { data: row, error } = await supabase
          .from('users')   // tu tabla real
          .select('is_premium')
          .eq('id', uid)
          .single();
        if (error) throw error;
        setIsPremium(!!row?.is_premium);
      } catch {
        setIsPremium(false);
      } finally {
        setLoadingAccess(false);
      }
    })();
  }, []);

  // --- Helper para llamar a la Edge Function con JWT ---
  const callAi = useCallback(async (payload) => {
    const { data: sess } = await supabase.auth.getSession();
    const jwt = sess?.session?.access_token;

    const res = await fetch(AI_CONSULTAS_ENDPOINT, {
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
      if (json?.error === 'PREMIUM_ONLY') throw new Error('Esta función es solo para usuarios premium.');
      if (json?.error === 'INSUFFICIENT_QUOTA') throw new Error('La IA está sin cupo temporalmente. Intenta más tarde.');
      throw new Error(json?.error || text || `HTTP ${res.status}`);
    }
    return json;
  }, []);

  // =======================
  // 1) TOP CONSUMERS
  // =======================
  const [hs1, setHs1] = useState('');
  const [topLoading, setTopLoading] = useState(false);
  const [topError, setTopError] = useState('');
  const [topRows, setTopRows] = useState([]);

  const handleTopConsumers = useCallback(async () => {
    setTopError('');
    setTopRows([]);
    const hs = String(hs1 || '').trim();
    if (!isHSLike(hs)) { setTopError('Ingresa una fracción arancelaria válida (6–10 dígitos).'); return; }

    try {
      setTopLoading(true);
      const data = await callAi({ mode: 'top_consumers', hs_code: hs });
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      setTopRows(rows);
    } catch (e) {
      setTopError(e.message || 'Error al consultar IA.');
    } finally {
      setTopLoading(false);
    }
  }, [hs1, callAi]);

  // =======================
  // 2) REQUIREMENTS
  // =======================
  const [hs2, setHs2] = useState('');
  const [origin2, setOrigin2] = useState('México');
  const [dest2, setDest2] = useState('Estados Unidos');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState('');
  const [reqData, setReqData] = useState({
    export_requirements: [],
    import_requirements: [],
    nTM: [],
    references: [],
  });

  const handleRequirements = useCallback(async () => {
    setReqError('');
    setReqData({ export_requirements: [], import_requirements: [], nTM: [], references: [] });
    const hs = String(hs2 || '').trim();
    if (!isHSLike(hs)) { setReqError('Ingresa una fracción arancelaria válida (6–10 dígitos).'); return; }

    try {
      setReqLoading(true);
      const data = await callAi({
        mode: 'requirements',
        hs_code: hs,
        origin_country: origin2,
        destination_country: dest2,
      });
      setReqData({
        export_requirements: Array.isArray(data?.export_requirements) ? data.export_requirements : [],
        import_requirements: Array.isArray(data?.import_requirements) ? data.import_requirements : [],
        nTM: Array.isArray(data?.nTM) ? data.nTM : [],
        references: Array.isArray(data?.references) ? data.references : [],
      });
    } catch (e) {
      setReqError(e.message || 'Error al consultar IA.');
    } finally {
      setReqLoading(false);
    }
  }, [hs2, origin2, dest2, callAi]);

  // =======================
  // 3) BUYERS
  // =======================
  const [hs3, setHs3] = useState('');
  const [dest3, setDest3] = useState('Estados Unidos');
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersError, setBuyersError] = useState('');
  const [buyers, setBuyers] = useState([]);

  const handleBuyers = useCallback(async () => {
    setBuyersError('');
    setBuyers([]);
    const hs = String(hs3 || '').trim();
    if (!isHSLike(hs)) { setBuyersError('Ingresa una fracción arancelaria válida (6–10 dígitos).'); return; }

    try {
      setBuyersLoading(true);
      const data = await callAi({ mode: 'buyers', hs_code: hs, destination_country: dest3 });
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      setBuyers(rows);
    } catch (e) {
      setBuyersError(e.message || 'Error al consultar IA.');
    } finally {
      setBuyersLoading(false);
    }
  }, [hs3, dest3, callAi]);

  // =======================
  // Render
  // =======================
  if (loadingAccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Spinner /> <span>Verificando acceso premium…</span>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Consultas Premium</h2>
        <p className="text-gray-600">
          Esta sección está disponible solo para usuarios Premium. Actualiza tu plan para acceder a consultas avanzadas por fracción arancelaria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Consultas Ilimitadas (IA)</h2>
        <p className="text-emerald-50 mt-1">
          Ingresa tu fracción arancelaria (HS) para obtener <b>Top países consumidores</b>, <b>requisitos</b> y <b>directorio de compradores</b>.
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        {/* Campo 1 */}
        <Card
          title="1) ¿Qué países consumen tu producto? (Top 10)"
          subtitle="Basado en tendencias globales de importación por fracción HS."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">🌍</span>}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fracción arancelaria (8 dígitos recomendado)
              </label>
              <input
                type="text"
                value={hs1}
                onChange={(e) => setHs1(e.target.value.replace(/\s/g,''))}
                placeholder="Ej. 08044010"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="flex items-center gap-2 mt-1">
                {hs1 ? (
                  isHSLike(hs1)
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">HS válido</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">HS inválido</span>
                ) : null}
              </div>
            </div>

            <Button onClick={handleTopConsumers} disabled={topLoading || !hs1}>
              {topLoading ? <><Spinner /> Consultando…</> : <>Analizar</>}
            </Button>

            {!!topRows.length && (
              <ButtonSecondary onClick={() => downloadCSV(topRows, `top_consumers_${hs1}.csv`)}>
                Descargar CSV
              </ButtonSecondary>
            )}
          </div>

          {topError && <p className="text-sm text-red-600 mt-3">{topError}</p>}

          {!topLoading && !topError && topRows.length === 0 && hs1 && isHSLike(hs1) && (
            <div className="mt-4 text-sm text-gray-500">Sin resultados directos por ahora. Prueba con otra subpartida o revisa “Capacitación”.</div>
          )}

          {topLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Spinner /> Consultando…</div>
          ) : !!topRows.length && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">País</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Importaciones (USD)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Participación</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Notas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {topRows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{r.country}</td>
                      <td className="px-4 py-2 text-sm">{r.import_value}</td>
                      <td className="px-4 py-2 text-sm">{r.share}</td>
                      <td className="px-4 py-2 text-sm">{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Campo 2 */}
        <Card
          title="2) Requisitos para exportar/importar"
          subtitle="Documentos, permisos y NTMs (por origen/destino)."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">📦</span>}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fracción arancelaria (HS)</label>
              <input
                type="text"
                value={hs2}
                onChange={(e) => setHs2(e.target.value.replace(/\s/g,''))}
                placeholder="Ej. 08044010"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="mt-1">
                {hs2 ? (
                  isHSLike(hs2)
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">HS válido</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">HS inválido</span>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
                <select
                  value={origin2}
                  onChange={(e) => setOrigin2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {COUNTRY_LIST.map((c) => <option key={`o-${c}`} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País destino</label>
                <select
                  value={dest2}
                  onChange={(e) => setDest2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {COUNTRY_LIST.map((c) => <option key={`d-${c}`} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Button onClick={handleRequirements} disabled={reqLoading || !hs2}>
              {reqLoading ? <><Spinner /> Consultando…</> : <>Consultar requisitos</>}
            </Button>
          </div>

          {reqError && <p className="text-sm text-red-600 mt-3">{reqError}</p>}

          {!reqLoading && !reqError && (reqData.export_requirements.length + reqData.import_requirements.length + reqData.nTM.length) === 0 && hs2 && isHSLike(hs2) && (
            <div className="mt-4 text-sm text-gray-500">Sin resultados directos por ahora. Revisa “Capacitación” para afinar tu consulta.</div>
          )}

          {reqLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Spinner /> Consultando…</div>
          ) : (reqData.export_requirements.length + reqData.import_requirements.length + reqData.nTM.length > 0) && (
            <div className="mt-5 space-y-5">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Salida del país de origen (exportación)</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {reqData.export_requirements.map((r, i) => <li key={`ex-${i}`}>{r}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Entrada al país destino (importación)</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {reqData.import_requirements.map((r, i) => <li key={`im-${i}`}>{r}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Regulaciones No Arancelarias (RNAS/NTMs) - destino</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {reqData.nTM.map((r, i) => <li key={`ntm-${i}`}>{r}</li>)}
                </ul>
              </div>
              {reqData.references?.length > 0 && (
                <div className="text-xs text-gray-500">
                  <div className="font-semibold mb-1">Referencias / fuentes sugeridas</div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {reqData.references.map((r, i) => <li key={`ref-${i}`}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Campo 3 */}
        <Card
          title="3) ¿A quién venderle? (Top 10)"
          subtitle="Empresas importadoras afines a tu producto por país destino."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">🏢</span>}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fracción arancelaria (HS)</label>
              <input
                type="text"
                value={hs3}
                onChange={(e) => setHs3(e.target.value.replace(/\s/g,''))}
                placeholder="Ej. 08044010"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="mt-1">
                {hs3 ? (
                  isHSLike(hs3)
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">HS válido</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">HS inválido</span>
                ) : null}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País destino</label>
              <select
                value={dest3}
                onChange={(e) => setDest3(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                {COUNTRY_LIST.map((c) => <option key={`bd-${c}`} value={c}>{c}</option>)}
              </select>
            </div>

            <Button onClick={handleBuyers} disabled={buyersLoading || !hs3}>
              {buyersLoading ? <><Spinner /> Buscando…</> : <>Buscar empresas</>}
            </Button>

            {!!buyers.length && (
              <ButtonSecondary onClick={() => downloadCSV(buyers, `buyers_${hs3}_${dest3}.csv`)}>
                Descargar CSV
              </ButtonSecondary>
            )}
          </div>

          {buyersError && <p className="text-sm text-red-600 mt-3">{buyersError}</p>}

          {!buyersLoading && !buyersError && buyers.length === 0 && hs3 && isHSLike(hs3) && (
            <div className="mt-4 text-sm text-gray-500">Sin resultados directos por ahora. Prueba un destino alterno o ve a “Prospección Masiva”.</div>
          )}

          {buyersLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Spinner /> Consultando…</div>
          ) : !!buyers.length && (
            <>
              <div className="overflow-x-auto mt-4 mb-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Contacto</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Website</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Ciudad</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">País</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {buyers.map((b, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{b.company}</td>
                        <td className="px-4 py-2 text-sm">{b.contact}</td>
                        <td className="px-4 py-2 text-sm">
                          {b.website ? (
                            <a href={b.website} target="_blank" rel="noreferrer" className="text-green-700 underline">
                              {b.website}
                            </a>
                          ) : ''}
                        </td>
                        <td className="px-4 py-2 text-sm">{b.city}</td>
                        <td className="px-4 py-2 text-sm">{b.country}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-sm text-gray-600">
                💡 Siguiente paso recomendado: ve a la pestaña <b>Prospección Masiva</b> para contactar a gran escala.
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ConsultasTab;
