import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient'; // ajusta ruta si cambia

const DEFAULT_COUNTRIES = [
  'Estados Unidos','Canadá','México','Brasil','Chile','Argentina','Colombia','Perú',
  'España','Francia','Alemania','Italia','Reino Unido','Emiratos Árabes Unidos',
  'Arabia Saudita','India','China','Japón','Corea del Sur','Australia',
];

// 🔧 Asegúrate que este bucket exista en Supabase Storage
const BUCKET_NAME = 'prospect-photos';

// ----------- UI helpers (coherentes con ConsultasTab) -----------
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-600" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

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

const Card = ({ title, subtitle, children, icon }) => (
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
  </div>
);

// -------------------- Componente principal ---------------------
const ProspeccionTab = ({
  walletBalance,
  setWalletBalance,
  countries = [],
  handleFileChange, // si el padre lo envía, lo usamos
  // Props opcionales desde el padre (si no llegan, usamos estado local)
  companyName,
  setCompanyName,
  productToExport,
  setProductToExport,
  targetCountry,
  setTargetCountry,
  productPhotos = [],
  companyWebsite,
  setCompanyWebsite,
  facebookLink,
  setFacebookLink,
}) => {
  // ---------- Países (selección ÚNICA) ----------
  const countryOptions = useMemo(
    () => (Array.isArray(countries) && countries.length ? countries : DEFAULT_COUNTRIES),
    [countries]
  );

  // ---------- Estado local con “fallback” si no hay setters del padre ----------
  const [localCompanyName, setLocalCompanyName] = useState(companyName ?? '');
  const [localProductToExport, setLocalProductToExport] = useState(productToExport ?? '');
  const [localCompanyWebsite, setLocalCompanyWebsite] = useState(companyWebsite ?? '');
  const [localFacebookLink, setLocalFacebookLink] = useState(facebookLink ?? '');
  const [localCountry, setLocalCountry] = useState(
    typeof targetCountry === 'string' ? targetCountry : ''
  );

  // Archivos locales (cuando no hay manejador del padre)
  const [localFiles, setLocalFiles] = useState([]);

  // Si el padre cambia props externamente, sincronizamos
  useEffect(() => { if (typeof companyName === 'string') setLocalCompanyName(companyName); }, [companyName]);
  useEffect(() => { if (typeof productToExport === 'string') setLocalProductToExport(productToExport); }, [productToExport]);
  useEffect(() => { if (typeof companyWebsite === 'string') setLocalCompanyWebsite(companyWebsite); }, [companyWebsite]);
  useEffect(() => { if (typeof facebookLink === 'string') setLocalFacebookLink(facebookLink); }, [facebookLink]);
  useEffect(() => { if (typeof targetCountry === 'string') setLocalCountry(targetCountry); }, [targetCountry]);

  // Handlers que actualizan local y, si existen, llaman al setter del padre
  const onCompanyName = (v) => {
    setLocalCompanyName(v);
    if (typeof setCompanyName === 'function') setCompanyName(v);
  };
  const onProductToExport = (v) => {
    setLocalProductToExport(v);
    if (typeof setProductToExport === 'function') setProductToExport(v);
  };
  const onCompanyWebsite = (v) => {
    setLocalCompanyWebsite(v);
    if (typeof setCompanyWebsite === 'function') setCompanyWebsite(v);
  };
  const onFacebookLink = (v) => {
    setLocalFacebookLink(v);
    if (typeof setFacebookLink === 'function') setFacebookLink(v);
  };
  const onCountry = (v) => {
    setLocalCountry(v);
    if (typeof setTargetCountry === 'function') setTargetCountry(v);
  };

  // ---------- Google Apps Script ----------
  const GOOGLE_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbyKpvzlMDGA5uLlWP748cRW7nPsQoMiGrbcLxFafKgHUd5liuvUovEbxGx0tEfsQXFP/exec';

  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [sheetProspects, setSheetProspects] = useState([]);

  // Email para filtrar (UI manual)
  const [filterEmail, setFilterEmail] = useState('');

  const fetchSheet = useCallback(async () => {
    let rawText = '';
    try {
      setSheetLoading(true);
      setSheetError('');

      const email = String(filterEmail || '').trim().toLowerCase();
      if (!email) {
        setSheetProspects([]);
        setSheetError('Ingresa tu email para ver tus prospectos.');
        return;
      }

      const url = `${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(email)}`;
      const res = await fetch(url, { method: 'GET' });

      if (!res.ok) {
        try { rawText = await res.text(); } catch {}
        throw new Error(`HTTP ${res.status}${rawText ? ` — ${rawText.slice(0, 200)}` : ''}`);
      }

      rawText = await res.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Respuesta no JSON: ${rawText.slice(0, 200)}${rawText.length > 200 ? '…' : ''}`);
      }

      if (data?.ok === false) {
        throw new Error(data?.error || 'Error desconocido en Apps Script');
      }

      // El backend ya viene filtrado por email
      const rows = Array.isArray(data?.data) ? data.data : [];

      const items = rows.map((row, i) => {
        const statusRaw = String(row.status ?? row.Estado ?? '').trim();
        const status =
          /nuevo/i.test(statusRaw) ? 'Nuevo' :
          /contactado/i.test(statusRaw) ? 'Contactado' :
          /calificado/i.test(statusRaw) ? 'Calificado' :
          (statusRaw || 'Nuevo');

        return {
          id: row.id || `gs-${i}`,
          name: String(row.name ?? row.Nombre ?? 'Sin nombre'),
          contact: String(row.contact ?? row.Contacto ?? row.email ?? ''),
          status,
          date: String(row.date ?? row.Fecha ?? ''),
        };
      });

      setSheetProspects(items);
    } catch (err) {
      setSheetProspects([]);
      setSheetError(`Error al cargar Google Sheet: ${err.message}`);
    } finally {
      setSheetLoading(false);
    }
  }, [filterEmail]);

  // ---------- Subida de fotos (opcional, a Storage) ----------
  /**
   * Sube hasta 5 fotos y devuelve un array de URLs públicas.
   * Si falla alguna, continúa con las demás.
   */
  const uploadPhotosIfAny = useCallback(async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return [];

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) throw authErr;
    const uid = authData?.user?.id || 'anon';

    const max = 5;
    const selected = list.slice(0, max);
    const urls = [];

    for (const file of selected) {
      try {
        const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `${uid}/${filename}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(path, file, {
            upsert: false,
            contentType: file.type || undefined,
          });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
        if (pub?.publicUrl) urls.push(pub.publicUrl);
      } catch (err) {
        console.warn('Error subiendo foto:', err.message);
      }
    }

    return urls;
  }, []);

  // ---------- Helpers de Cartera (DB) ----------
  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const uid = data?.user?.id;
    if (!uid) throw new Error('No hay sesión activa.');
    return uid;
  };

  const ensureWallet = async (userId) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('user_id,balance')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const { error: insErr } = await supabase.from('wallets').insert({ user_id: userId, balance: 0 });
      if (insErr) throw insErr;
      return { user_id: userId, balance: 0 };
    }
    return data;
  };

  const readDbBalance = async (userId) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return Number(data?.balance || 0);
  };

  // Registra el cargo de campaña y actualiza saldo (transaction_type: 'debit')
  const debitForCampaign = async (amount) => {
    const uid = await getUserId();
    await ensureWallet(uid);

    // Lee balance actual
    const { data: w, error: wErr } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', uid)
      .maybeSingle();
    if (wErr) throw wErr;

    const current = Number(w?.balance || 0);
    if (current < amount) {
      throw new Error('Saldo insuficiente en la cartera.');
    }

    // Inserta transacción DEBIT (sin paypal_transaction_id)
    const txPayload = {
      user_id: uid,
      amount: Number(amount),
      transaction_type: 'debit',
      source: 'campaign',
      status: 'completed',
    };

    const { error: txErr } = await supabase
      .from('wallet_transactions')
      .insert([txPayload]);
    if (txErr) {
      console.error('wallet_transactions insert error:', txErr);
      throw txErr;
    }

    // Actualiza balance
    const newBal = Number((current - amount).toFixed(2));
    const { error: upErr } = await supabase
      .from('wallets')
      .update({ balance: newBal, updated_at: new Date().toISOString() })
      .eq('user_id', uid);
    if (upErr) throw upErr;

    return newBal;
  };

  // ---------- Generar campaña (descuento persistente en DB) ----------
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitOk, setSubmitOk] = useState('');

  const onGenerateCampaign = useCallback(async () => {
    setSubmitError(''); setSubmitOk('');

    // Validación rápida de UI
    if (!localCompanyName.trim() || !localProductToExport.trim() || !localCountry.trim() || !localCompanyWebsite.trim()) {
      setSubmitError('Completa: Empresa, Producto, País meta y Sitio web.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) Usuario y wallet
      const userId = await getUserId();
      await ensureWallet(userId);

      // 2) Verifica saldo (en DB)
      const currentBalance = await readDbBalance(userId);
      if (currentBalance < 50) {
        throw new Error('Saldo insuficiente en tu cartera. Necesitas $50 USD.');
      }

      // 3) Subir fotos si hay (usa prop o local)
      const selectedFiles = (Array.isArray(productPhotos) && productPhotos.length)
        ? productPhotos
        : localFiles;

      let uploadUrls = [];
      if (Array.isArray(selectedFiles) && selectedFiles.length) {
        uploadUrls = await uploadPhotosIfAny(selectedFiles);
      }

      // 4) Inserta prospecto (intenta primero como ARRAY por si 'photo' es text[])
      const now = new Date().toISOString();

      const basePayload = {
        user_id: userId,
        status: 'Nuevo',
        company_name: localCompanyName.trim(),
        product: localProductToExport.trim(),
        country: localCountry.trim(),
        website: localCompanyWebsite.trim(),
        facebook: (localFacebookLink || '').trim(),
        date: now,
      };

      let payload = {
        ...basePayload,
        photo: uploadUrls.length ? uploadUrls : null,
      };

      let ins = await supabase
        .from('prospects')
        .insert(payload)
        .select('*')
        .single();

      // Si falló por "malformed array literal", reintenta como string (primera URL o null)
      if (ins.error && /malformed array literal|array/i.test(String(ins.error.message || ''))) {
        payload = {
          ...basePayload,
          photo: uploadUrls[0] || null,
        };
        ins = await supabase
          .from('prospects')
          .insert(payload)
          .select('*')
          .single();
      }

      if (ins.error) throw ins.error;

      // 5) Registra transacción DEBIT (50) y actualiza saldo en DB
      const newBal = await debitForCampaign(50);

      // 6) Refresca saldo en UI
      setWalletBalance(newBal);

      setSubmitOk('¡Campaña generada! Se descontaron $50, se subieron tus fotos y se envió solicitud al equipo de Vendedores Internacionales.');
      // Limpieza local opcional
      setLocalFiles([]);
    } catch (err) {
      setSubmitError(`No se pudo generar la campaña: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [
    localCompanyName,
    localProductToExport,
    localCountry,
    localCompanyWebsite,
    localFacebookLink,
    productPhotos,
    localFiles,
    setWalletBalance,
    uploadPhotosIfAny
  ]);

  // ---------- Render (mismo estilo que ConsultasTab) ----------
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Prospección Masiva de Compradores</h2>
        <p className="text-emerald-50 mt-1">
          Genera una campaña enfocada y recibe prospectos verificados. Costo por campaña: <b>$50</b>.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-600/20 text-white rounded-full px-3 py-1 text-sm">
          Billetera: <span className="font-semibold">${Number(walletBalance ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        {/* Formulario principal */}
        <Card
          title="1) Datos de tu campaña"
          subtitle="Completa la información. Puedes adjuntar hasta 5 fotos del producto."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">📝</span>}
        >
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{submitError}</div>
          )}
          {submitOk && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{submitOk}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de empresa
              </label>
              <input
                type="text" id="company-name"
                value={localCompanyName}
                onChange={(e) => onCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="product-export" className="block text-sm font-medium text-gray-700 mb-1">
                Producto a Exportar
              </label>
              <input
                type="text" id="product-export"
                value={localProductToExport}
                onChange={(e) => onProductToExport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="target-country" className="block text-sm font-medium text-gray-700 mb-1">
                País meta
              </label>
              <select
                id="target-country"
                value={localCountry}
                onChange={(e) => onCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              >
                <option value="">Selecciona un país</option>
                {countryOptions.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
              <div className="mt-1">
                {localCountry
                  ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">País seleccionado</span>
                  : null}
              </div>
            </div>

            <div>
              <label htmlFor="company-website" className="block text-sm font-medium text-gray-700 mb-1">
                Página web de la empresa
              </label>
              <input
                type="url" id="company-website"
                value={localCompanyWebsite}
                onChange={(e) => onCompanyWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="product-photos" className="block text-sm font-medium text-gray-700 mb-1">
                Adjuntar fotos del producto (opcional, máx. 5)
              </label>
              <input
                type="file" id="product-photos" multiple accept="image/*"
                onChange={(e) => {
                  if (typeof handleFileChange === 'function') {
                    handleFileChange(e);
                  } else {
                    const files = Array.from(e.target.files || []);
                    setLocalFiles(files);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              {(() => {
                const arr = (Array.isArray(productPhotos) && productPhotos.length) ? productPhotos : localFiles;
                return Array.isArray(arr) && arr.length > 0 ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Archivos seleccionados: {arr.map((f) => String(f.name || f?.path || 'archivo')).join(', ')}
                  </p>
                ) : null;
              })()}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="facebook-link" className="block text-sm font-medium text-gray-700 mb-1">
                Link de Facebook de la empresa (opcional)
              </label>
              <input
                type="url" id="facebook-link"
                value={localFacebookLink}
                onChange={(e) => onFacebookLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <Button onClick={onGenerateCampaign} disabled={submitting}>
              {submitting ? <><Spinner /> Generando…</> : <>Generar Campaña de Prospección</>}
            </Button>
          </div>
        </Card>

        {/* Google Sheet */}
        <Card
          title="2) Tus Prospectos Calificados"
          subtitle="Resultados visibles de 8–10 días hábiles después de generar tu campaña."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">📊</span>}
        >
          <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto] items-end">
            <div>
              <label htmlFor="filter-email" className="block text-sm font-medium text-gray-700 mb-1">
                Ingresa el email con el que te registraste para ver tus prospectos
              </label>
              <input
                id="filter-email"
                type="email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="usuario@dominio.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <ButtonSecondary onClick={() => fetchSheet()}>Refrescar</ButtonSecondary>
          </div>

          {sheetLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner /> Cargando datos…
            </div>
          ) : sheetError ? (
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">{sheetError}</div>
          ) : sheetProspects.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay prospectos para ese email.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contacto</th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sheetProspects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {String(p.name ?? '')}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-600">
                        {(() => {
                          const str = String(p.contact ?? '');
                          if (str.indexOf('/') > -1) {
                            const parts = str.split('/');
                            const tel = String(parts[0] ?? '').trim();
                            const mail = String(parts[1] ?? '').trim();
                            return (
                              <span>
                                <span className="block">{tel}</span>
                                <span className="block">{mail}</span>
                              </span>
                            );
                          }
                          return str;
                        })()}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.status === 'Nuevo'
                              ? 'bg-blue-100 text-blue-800'
                              : p.status === 'Contactado'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {String(p.status ?? 'Nuevo')}
                        </span>
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-600">
                        {String(p.date ?? '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProspeccionTab;

