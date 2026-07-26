import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient'; // ajusta ruta si cambia

const DEFAULT_COUNTRIES = [
  'Estados Unidos','Canadá','México','Brasil','Chile','Argentina','Colombia','Perú',
  'España','Francia','Alemania','Italia','Reino Unido','Emiratos Árabes Unidos',
  'Arabia Saudita','India','China','Japón','Corea del Sur','Australia',
];

// 🔧 Asegúrate que este bucket exista en Supabase Storage
const BUCKET_NAME = 'prospect-photos';

// ✅ Administrador autorizado para visualizar información interna de integraciones
const ADMIN_ID = '91e330bb-4133-4246-abcc-4f470495b7f9';

// ----------- UI helpers -----------
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const Button = ({ children, className = '', ...props }) => (
  <button
    className={
      'h-[46px] inline-flex items-center justify-center gap-2 px-5 rounded-2xl text-sm font-bold transition-all ' +
      'bg-[#045023] hover:bg-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed ' +
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
      'h-[46px] inline-flex items-center justify-center gap-2 px-5 rounded-2xl text-sm font-bold transition-all ' +
      'bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ' +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Card = ({ title, subtitle, children, icon, className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-5 md:px-6 py-5 border-b border-gray-100 flex items-start gap-3">
        {icon && <div className="text-green-700 mt-0.5">{icon}</div>}
        <div>
          <div className="text-lg md:text-xl font-extrabold text-gray-900">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    )}
    <div className="p-5 md:p-6">{children}</div>
  </div>
);

const Badge = ({ children, variant = 'green' }) => {
  const styles = {
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styles[variant] || styles.green}`}>
      {children}
    </span>
  );
};

const AgentStatusBadge = ({ status }) => {
  if (status === 'Listo') return <Badge variant="green">Listo</Badge>;
  if (status === 'En integración') return <Badge variant="blue">En integración</Badge>;
  if (status === 'Próximamente') return <Badge variant="yellow">Próximamente</Badge>;
  return <Badge variant="gray">Pendiente</Badge>;
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
    {children}
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

  // Wizard UI
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Visibilidad exclusiva para información interna de integraciones
  const [isAdmin, setIsAdmin] = useState(false);

  // Verifica si el usuario autenticado es el administrador autorizado.
  // Esta validación solo controla visibilidad; no modifica campañas, cartera ni Supabase.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (mounted) {
          setIsAdmin(data?.user?.id === ADMIN_ID);
        }
      } catch (error) {
        console.warn('No fue posible verificar el acceso de administrador:', error?.message || error);
        if (mounted) setIsAdmin(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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
      setWizardOpen(false);
      setWizardStep(1);
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

  const selectedFilesForUi = (Array.isArray(productPhotos) && productPhotos.length) ? productPhotos : localFiles;
  const balanceNumber = Number(walletBalance ?? 0);

  const AGENTS = [
    { name: 'Agente 1 — Análisis del producto', status: 'Listo' },
    { name: 'Agente 2 — Inteligencia de mercado', status: 'Listo' },
    { name: 'Agente 3 — Buyer Persona IA', status: 'En integración' },
    { name: 'Agente 4 — Creativos publicitarios IA', status: 'Próximamente' },
    { name: 'Agente 5 — Publicación de campaña', status: 'Pendiente' },
    { name: 'Agente 6 — Respuesta automática a interesados', status: 'Pendiente' },
    { name: 'Agente 7 — CRM y seguimiento', status: 'Pendiente' },
    { name: 'Agente 8 — Optimización', status: 'Pendiente' },
    { name: 'Agente 9 — Director Comercial IA', status: 'Pendiente' },
    { name: 'Agente 10 — Ejecutivo de Comercio Internacional IA', status: 'En integración' },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard principal */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 relative overflow-hidden">
            <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge>Equipo Comercial IA</Badge>
                <span className="text-sm text-gray-500">Prospección internacional asistida por IA</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Prospección Masiva de Compradores
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Activa un equipo comercial impulsado por IA para encontrar compradores potenciales,
                dar seguimiento inicial y organizar oportunidades comerciales en el país objetivo.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setWizardOpen(true);
                    setWizardStep(1);
                    setSubmitError('');
                    setSubmitOk('');
                  }}
                  className="w-full sm:w-auto bg-[#045023] hover:bg-green-800"
                >
                  🚀 Contratar Equipo Comercial IA
                </Button>

                <ButtonSecondary type="button" className="w-full sm:w-auto">
                  ▶ Ver tutorial
                </ButtonSecondary>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5 bg-gradient-to-br from-[#045023] to-green-600 text-white border-0">
            <p className="text-sm text-white/80">Saldo disponible</p>
            <h3 className="text-4xl font-extrabold mt-1">${balanceNumber.toFixed(2)}</h3>
            <p className="text-sm text-white/80 mt-1">USD para campañas activas</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-gray-500">Estado del Equipo Comercial IA</p>
            <h3 className="text-xl font-extrabold text-gray-900 mt-2">En integración</h3>
            <p className="text-sm text-gray-500 mt-1">Agentes conectándose por etapas.</p>
          </Card>
        </div>
      </section>

      {submitError && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">{submitError}</div>}
      {submitOk && <div className="p-4 rounded-2xl bg-green-50 text-green-700 text-sm">{submitOk}</div>}

      {/* Métricas usuario */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['🌎', 'País objetivo', localCountry || 'Sin definir'],
          ['🚀', 'Campañas activas', submitOk ? '1' : '0'],
          ['👥', 'Prospectos encontrados', sheetProspects.length || '0'],
          ['⭐', 'Prospectos calificados', sheetProspects.filter((p) => p.status === 'Calificado').length || '0'],
        ].map(([icon, label, value]) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-green-50 flex items-center justify-center text-xl">
                {icon}
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="Estado de campaña" subtitle="Avance visible para el usuario" icon={<span>📊</span>}>
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center">
            <div className="relative h-40 w-40 mx-auto">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(#22C55E 72deg, #E5E7EB 0deg)' }}
              />
              <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-green-700">2/10</span>
                <span className="text-xs text-gray-500 mt-1">Agentes activos</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">País objetivo</p>
                <p className="font-extrabold text-gray-900">{localCountry || 'Aún no definido'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Producto</p>
                <p className="font-extrabold text-gray-900">{localProductToExport || 'Aún no definido'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Equipo Comercial IA</p>
                <p className="font-extrabold text-green-700">En integración</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Actividad reciente" subtitle="Eventos visibles de avance" icon={<span>⚡</span>}>
          <div className="space-y-4">
            {[
              ['Análisis del producto', 'Listo para integrarse con los datos de campaña.', 'Listo'],
              ['Inteligencia de mercado', 'Preparado para identificar señales del país objetivo.', 'Listo'],
              ['Buyer Persona IA', 'Construcción del perfil ideal del comprador.', 'En integración'],
              ['Creativos publicitarios IA', 'Disponible en una siguiente fase.', 'Próximamente'],
            ].map(([title, desc, status]) => (
              <div key={title} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-extrabold text-gray-900 text-sm">{title}</p>
                    <AgentStatusBadge status={status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Agentes IA: información interna visible únicamente para el administrador */}
      {isAdmin && (
        <Card title="Avance de Agentes IA" subtitle="Vista informativa. Algunas funciones aún están en integración." icon={<span>🤖</span>}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {AGENTS.map((agent, index) => (
              <div key={agent.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Etapa {index + 1}</p>
                  </div>
                  <AgentStatusBadge status={agent.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Google Sheet */}
      <Card
        title="Tus Prospectos Calificados"
        subtitle="Resultados visibles de 8–10 días hábiles después de activar tu campaña."
        icon={<span>📊</span>}
      >
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto] items-end">
          <Field label="Ingresa el email con el que te registraste para ver tus prospectos">
            <input
              id="filter-email"
              type="email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="usuario@dominio.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </Field>

          <ButtonSecondary onClick={() => fetchSheet()}>Refrescar</ButtonSecondary>
        </div>

        {sheetLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4 animate-spin text-green-700" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Cargando datos…
          </div>
        ) : sheetError ? (
          <div className="p-3 rounded-2xl bg-yellow-50 text-yellow-800 text-sm">{sheetError}</div>
        ) : sheetProspects.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay prospectos para ese email.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 md:px-6 text-left text-xs font-bold text-gray-600 uppercase">Nombre</th>
                    <th className="px-4 py-3 md:px-6 text-left text-xs font-bold text-gray-600 uppercase">Contacto</th>
                    <th className="px-4 py-3 md:px-6 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 md:px-6 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
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
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
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
          </div>
        )}
      </Card>

      {/* Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 md:px-6 py-4 rounded-t-3xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge>Wizard de Prospección</Badge>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
                    Contratar Equipo Comercial IA
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Completa los datos de tu campaña. Se usará la misma lógica actual de activación.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setWizardOpen(false)}
                  className="h-10 w-10 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setWizardStep(step)}
                    className={`h-2 rounded-full ${wizardStep >= step ? 'bg-[#22C55E]' : 'bg-gray-200'}`}
                    aria-label={`Paso ${step}`}
                  />
                ))}
              </div>
            </div>

            <div className="p-5 md:p-6">
              {submitError && <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-sm">{submitError}</div>}
              {submitOk && <div className="mb-4 p-3 rounded-2xl bg-green-50 text-green-700 text-sm">{submitOk}</div>}

              {wizardStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-900">1. Información de empresa</h4>
                    <p className="text-sm text-gray-500 mt-1">Estos datos ayudan a entender tu oferta comercial.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre de empresa">
                      <input
                        type="text"
                        id="company-name"
                        value={localCompanyName}
                        onChange={(e) => onCompanyName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                      />
                    </Field>

                    <Field label="Producto a Exportar">
                      <input
                        type="text"
                        id="product-export"
                        value={localProductToExport}
                        onChange={(e) => onProductToExport(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                      />
                    </Field>

                    <Field label="Página web de la empresa">
                      <input
                        type="url"
                        id="company-website"
                        value={localCompanyWebsite}
                        onChange={(e) => onCompanyWebsite(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                      />
                    </Field>

                    <Field label="Facebook / Instagram / Red social de la empresa">
                      <input
                        type="url"
                        id="facebook-link"
                        value={localFacebookLink}
                        onChange={(e) => onFacebookLink(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-900">2. Mercado objetivo</h4>
                    <p className="text-sm text-gray-500 mt-1">Selecciona el país destino donde quieres prospectar compradores.</p>
                  </div>

                  <Field label="País meta">
                    <select
                      id="target-country"
                      value={localCountry}
                      onChange={(e) => onCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none"
                      required
                    >
                      <option value="">Selecciona un país</option>
                      {countryOptions.map((country, index) => (
                        <option key={index} value={country}>{country}</option>
                      ))}
                    </select>
                  </Field>

                  {localCountry ? (
                    <div className="rounded-3xl bg-green-50 border border-green-100 p-5">
                      <p className="text-sm text-green-700 font-bold">País seleccionado</p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">{localCountry}</p>
                    </div>
                  ) : null}
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-900">3. Fotografías del producto</h4>
                    <p className="text-sm text-gray-500 mt-1">Puedes adjuntar hasta 5 imágenes del producto.</p>
                  </div>

                  <label className="block rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition p-8 text-center cursor-pointer">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl">
                      +
                    </div>
                    <p className="mt-3 text-sm font-bold text-gray-900">Adjuntar fotos del producto</p>
                    <p className="text-sm text-gray-500 mt-1">Opcional, máximo 5 imágenes.</p>

                    <input
                      type="file"
                      id="product-photos"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (typeof handleFileChange === 'function') {
                          handleFileChange(e);
                        } else {
                          const files = Array.from(e.target.files || []);
                          setLocalFiles(files);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {Array.isArray(selectedFilesForUi) && selectedFilesForUi.length > 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                      <p className="text-sm font-bold text-gray-900">Archivos seleccionados</p>
                      <p className="text-sm text-gray-500 mt-1 break-words">
                        {selectedFilesForUi.map((f) => String(f.name || f?.path || 'archivo')).join(', ')}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-900">4. Resumen y activación</h4>
                    <p className="text-sm text-gray-500 mt-1">Revisa la información antes de activar tu campaña.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Empresa</p>
                      <p className="font-extrabold text-gray-900 mt-1">{localCompanyName || 'Sin definir'}</p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Producto</p>
                      <p className="font-extrabold text-gray-900 mt-1">{localProductToExport || 'Sin definir'}</p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">País destino</p>
                      <p className="font-extrabold text-gray-900 mt-1">{localCountry || 'Sin definir'}</p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Saldo disponible</p>
                      <p className="font-extrabold text-green-700 mt-1">${balanceNumber.toFixed(2)} USD</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-green-50 border border-green-100 p-5">
                    <p className="text-sm text-green-800 font-bold">
                      Al activar la campaña se ejecutará el proceso actual de prospección y se registrará la solicitud en el sistema.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-5">
                <ButtonSecondary
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1) setWizardOpen(false);
                    else setWizardStep((prev) => Math.max(1, prev - 1));
                  }}
                  className="w-full sm:w-auto"
                >
                  {wizardStep === 1 ? 'Cancelar' : 'Atrás'}
                </ButtonSecondary>

                {wizardStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setWizardStep((prev) => Math.min(4, prev + 1))}
                    className="w-full sm:w-auto"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={onGenerateCampaign}
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? <><Spinner /> Activando…</> : 'Activar campaña'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspeccionTab;
