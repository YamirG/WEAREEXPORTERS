import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Button, Card, Badge, Input, Select, Alert, Loader, EmptyState } from '../ui';

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

// Spinner minimalista conservado por compatibilidad visual interna
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-700" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const FieldValidity = ({ value }) => {
  if (!value) return null;

  return isHSLike(value) ? (
    <Badge variant="success" className="mt-2">HS válido</Badge>
  ) : (
    <Badge variant="danger" className="mt-2">HS inválido</Badge>
  );
};

const PremiumModule = ({ number, icon, title, subtitle, children }) => (
  <Card className="overflow-hidden">
    <div className="px-5 md:px-6 py-5 border-b border-gray-100 bg-white">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Consulta {number}</Badge>
            <span className="text-xs text-gray-400">IA especializada en exportación</span>
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-2 leading-tight">
            {title}
          </h3>

          {subtitle && (
            <p className="text-sm md:text-base text-gray-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>

    <div className="p-5 md:p-6">
      {children}
    </div>
  </Card>
);

const TableShell = ({ children }) => (
  <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <div className="overflow-x-auto">
      {children}
    </div>
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
      <Card className="p-6">
        <Loader text="Verificando acceso premium…" />
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <Card className="p-6 md:p-8">
        <div className="max-w-2xl">
          <Badge variant="warning">Acceso restringido</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-4">
            Consultas Premium
          </h2>
          <p className="text-gray-600 mt-3 leading-relaxed">
            Esta sección está disponible solo para usuarios Premium. Actualiza tu plan para acceder a consultas avanzadas por fracción arancelaria.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Consultas IA</Badge>
                <span className="text-sm text-gray-500">Análisis por fracción arancelaria</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Inteligencia para exportar con claridad
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Ingresa tu fracción arancelaria HS para identificar países con demanda,
                requisitos de exportación/importación y empresas compradoras potenciales.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Módulos disponibles</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-1">3</h3>
            <p className="text-sm text-gray-500 mt-1">Mercado, requisitos y compradores.</p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Recomendación</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              Usa HS de 8 dígitos
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Entre más precisa sea la fracción, mejores serán los resultados.
            </p>
          </Card>
        </div>
      </section>

      {/* Consulta 1 */}
      <PremiumModule
        number="1"
        icon="🌍"
        title="¿Qué países consumen tu producto?"
        subtitle="Top 10 de países consumidores basado en tendencias globales de importación por fracción HS."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] items-end">
          <div>
            <Input
              label="Fracción arancelaria HS"
              type="text"
              value={hs1}
              onChange={(e) => setHs1(e.target.value.replace(/\s/g,''))}
              placeholder="Ej. 08044010"
            />
            <FieldValidity value={hs1} />
          </div>

          <Button
            variant="secondary"
            onClick={handleTopConsumers}
            disabled={topLoading || !hs1}
            className="w-full lg:w-auto"
          >
            {topLoading ? <><Spinner /> Consultando…</> : <>Analizar</>}
          </Button>

          {!!topRows.length && (
            <Button
              variant="outline"
              onClick={() => downloadCSV(topRows, `top_consumers_${hs1}.csv`)}
              className="w-full lg:w-auto"
            >
              Descargar CSV
            </Button>
          )}
        </div>

        {topError && (
          <div className="mt-4">
            <Alert variant="danger">{topError}</Alert>
          </div>
        )}

        {!topLoading && !topError && topRows.length === 0 && hs1 && isHSLike(hs1) && (
          <div className="mt-5">
            <EmptyState
              title="Sin resultados directos por ahora"
              description="Prueba con otra subpartida o revisa Capacitación para afinar tu consulta."
            />
          </div>
        )}

        {topLoading ? (
          <div className="mt-5">
            <Loader text="Consultando países consumidores…" />
          </div>
        ) : !!topRows.length && (
          <TableShell>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">País</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Importaciones (USD)</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Participación</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {topRows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{r.country}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{r.import_value}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{r.share}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </PremiumModule>

      {/* Consulta 2 */}
      <PremiumModule
        number="2"
        icon="📦"
        title="Requisitos para exportar/importar"
        subtitle="Documentos, permisos, regulaciones no arancelarias y requisitos según país de origen y destino."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Input
              label="Fracción arancelaria HS"
              type="text"
              value={hs2}
              onChange={(e) => setHs2(e.target.value.replace(/\s/g,''))}
              placeholder="Ej. 08044010"
            />
            <FieldValidity value={hs2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="País de origen"
              value={origin2}
              onChange={(e) => setOrigin2(e.target.value)}
            >
              {COUNTRY_LIST.map((c) => <option key={`o-${c}`} value={c}>{c}</option>)}
            </Select>

            <Select
              label="País destino"
              value={dest2}
              onChange={(e) => setDest2(e.target.value)}
            >
              {COUNTRY_LIST.map((c) => <option key={`d-${c}`} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        <div className="mt-5">
          <Button
            variant="secondary"
            onClick={handleRequirements}
            disabled={reqLoading || !hs2}
            className="w-full sm:w-auto"
          >
            {reqLoading ? <><Spinner /> Consultando…</> : <>Consultar requisitos</>}
          </Button>
        </div>

        {reqError && (
          <div className="mt-4">
            <Alert variant="danger">{reqError}</Alert>
          </div>
        )}

        {!reqLoading && !reqError && (reqData.export_requirements.length + reqData.import_requirements.length + reqData.nTM.length) === 0 && hs2 && isHSLike(hs2) && (
          <div className="mt-5">
            <EmptyState
              title="Sin resultados directos por ahora"
              description="Revisa Capacitación para afinar tu consulta o prueba con otra fracción arancelaria."
            />
          </div>
        )}

        {reqLoading ? (
          <div className="mt-5">
            <Loader text="Consultando requisitos comerciales…" />
          </div>
        ) : (reqData.export_requirements.length + reqData.import_requirements.length + reqData.nTM.length > 0) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5">
              <Badge variant="success">Exportación</Badge>
              <h4 className="font-extrabold text-gray-900 mt-3 mb-3">
                Salida del país de origen
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {reqData.export_requirements.map((r, i) => (
                  <li key={`ex-${i}`} className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <Badge variant="success">Importación</Badge>
              <h4 className="font-extrabold text-gray-900 mt-3 mb-3">
                Entrada al país destino
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {reqData.import_requirements.map((r, i) => (
                  <li key={`im-${i}`} className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <Badge variant="neutral">RNAS / NTMs</Badge>
              <h4 className="font-extrabold text-gray-900 mt-3 mb-3">
                Regulaciones no arancelarias
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {reqData.nTM.map((r, i) => (
                  <li key={`ntm-${i}`} className="flex gap-2">
                    <span className="text-green-600">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {reqData.references?.length > 0 && (
              <Card className="p-5 lg:col-span-3 bg-gray-50">
                <h4 className="font-extrabold text-gray-900 mb-3">
                  Referencias / fuentes sugeridas
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {reqData.references.map((r, i) => <li key={`ref-${i}`}>{r}</li>)}
                </ul>
              </Card>
            )}
          </div>
        )}
      </PremiumModule>

      {/* Consulta 3 */}
      <PremiumModule
        number="3"
        icon="🏢"
        title="¿Quién ya esta vendiendo un producto como el tuyo?"
        subtitle="Top 10 de empresas importadoras afines a tu producto por país destino."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto] items-end">
          <div>
            <Input
              label="Fracción arancelaria HS"
              type="text"
              value={hs3}
              onChange={(e) => setHs3(e.target.value.replace(/\s/g,''))}
              placeholder="Ej. 08044010"
            />
            <FieldValidity value={hs3} />
          </div>

          <Select
            label="País destino"
            value={dest3}
            onChange={(e) => setDest3(e.target.value)}
          >
            {COUNTRY_LIST.map((c) => <option key={`bd-${c}`} value={c}>{c}</option>)}
          </Select>

          <Button
            variant="secondary"
            onClick={handleBuyers}
            disabled={buyersLoading || !hs3}
            className="w-full lg:w-auto"
          >
            {buyersLoading ? <><Spinner /> Buscando…</> : <>Buscar empresas</>}
          </Button>

          {!!buyers.length && (
            <Button
              variant="outline"
              onClick={() => downloadCSV(buyers, `buyers_${hs3}_${dest3}.csv`)}
              className="w-full lg:w-auto"
            >
              Descargar CSV
            </Button>
          )}
        </div>

        {buyersError && (
          <div className="mt-4">
            <Alert variant="danger">{buyersError}</Alert>
          </div>
        )}

        {!buyersLoading && !buyersError && buyers.length === 0 && hs3 && isHSLike(hs3) && (
          <div className="mt-5">
            <EmptyState
              title="Sin resultados directos por ahora"
              description="Prueba un destino alterno o ve a Prospección Masiva para contactar a escala."
            />
          </div>
        )}

        {buyersLoading ? (
          <div className="mt-5">
            <Loader text="Buscando empresas importadoras…" />
          </div>
        ) : !!buyers.length && (
          <>
            <TableShell>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Empresa</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Contacto</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Website</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Ciudad</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">País</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {buyers.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{b.company}</td>
                      <td className="px-5 py-3 text-sm text-gray-700">{b.contact}</td>
                      <td className="px-5 py-3 text-sm">
                        {b.website ? (
                          <a href={b.website} target="_blank" rel="noreferrer" className="text-green-700 underline break-all">
                            {b.website}
                          </a>
                        ) : ''}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{b.city}</td>
                      <td className="px-5 py-3 text-sm text-gray-700">{b.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>

            <div className="mt-4">
              <Alert variant="success">
                💡 Siguiente paso recomendado: ve a la pestaña <b>Prospección Masiva</b> para contactar a gran escala.
              </Alert>
            </div>
          </>
        )}
      </PremiumModule>
    </div>
  );
};

export default ConsultasTab;
