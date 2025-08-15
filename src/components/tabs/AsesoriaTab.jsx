import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../supabaseClient';

const AI_ENDPOINT =
  process.env.REACT_APP_AI_ENDPOINT ||
  'https://eaxaxvnfllukoflzuxcq.functions.supabase.co/ai-advice';

const QUICK_EXAMPLES = [
  '¿Clasificación Arancelaria?',
  'Trámites Aduanales.',
  '¿Precios de Exportación?',
  'INCOTERMS.',
];

const COUNTRIES_LATAM = [
  'México','Colombia','Chile','Perú','Argentina','Brasil','Ecuador','Uruguay','Paraguay','Bolivia','Costa Rica','Panamá','Guatemala','Honduras','El Salvador','Nicaragua','República Dominicana'
];
const COUNTRIES_WORLD_COMMON = [
  'Estados Unidos','Canadá','España','Francia','Alemania','Italia','Reino Unido','China','Japón','Corea del Sur','India','Emiratos Árabes Unidos'
];
const INCOTERMS = ['EXW','FCA','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'];

// ------- UI helpers (coherentes con otras pestañas) -------
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

const AsesoriaTab = () => {
  // Calendly solo para premium
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);

  // Usuario y premium
  const [userEmail, setUserEmail] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || '';
        setUserEmail(email);

        if (!userData?.user?.id) {
          setIsPremium(false);
          return;
        }

        // Lee is_premium desde tu tabla `users`
        const { data: profile, error } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', userData.user.id)
          .single();

        if (!error && profile) {
          setIsPremium(!!profile.is_premium);
        }

        // Inyecta Calendly badge sólo si es premium
        if (profile?.is_premium && !calendlyLoaded) {
          const css = document.createElement('link');
          css.href = 'https://assets.calendly.com/assets/external/widget.css';
          css.rel = 'stylesheet';
          document.head.appendChild(css);

          const script = document.createElement('script');
          script.src = 'https://assets.calendly.com/assets/external/widget.js';
          script.type = 'text/javascript';
          script.async = true;
          script.onload = () => {
            if (window.Calendly) {
              window.Calendly.initBadgeWidget({
                url: 'https://calendly.com/asesoresparaexportadores/1hora',
                text: 'Agenda Videollamada Asesoría',
                color: '#04b211',
                textColor: '#ffffff',
                branding: true,
              });
            }
          };
          document.body.appendChild(script);
          setCalendlyLoaded(true);
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [calendlyLoaded]);

  // Contexto
  const [origin, setOrigin] = useState('México');
  const [destination, setDestination] = useState('Estados Unidos');
  const [incoterm, setIncoterm] = useState('FOB');
  const [product, setProduct] = useState('');
  const [hsHint, setHsHint] = useState('');
  const [language, setLanguage] = useState('es'); // si más adelante quieres 'en'

  // Chat
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hola 👋 Soy tu asesor IA en comercio exterior. Selecciona tu contexto (origen, destino, Incoterm, producto) y escríbeme tu caso para darte pasos concretos.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendMessage = useCallback(
    async (text) => {
      const question = String(text || input).trim();
      if (!question) return;

      setErr('');
      setLoading(true);
      setMessages((prev) => [...prev, { role: 'user', content: question }]);
      setInput('');

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData?.session?.access_token;
        if (!jwt) throw new Error('Debes iniciar sesión');

        const res = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            question,
            user: userEmail || undefined,
            origin_country: origin || undefined,
            destination_country: destination || undefined,
            incoterm: incoterm || undefined,
            product: product || undefined,
            hs_hint: hsHint || undefined,
            language,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (data?.error === 'PREMIUM_ONLY') {
          throw new Error('Esta función es solo para usuarios premium.');
        }
        if (data?.error && !res.ok) {
          throw new Error(data.error);
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const answer = data?.answer || 'No se pudo generar respuesta.';
        setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      } catch (e) {
        setErr(e.message || 'Fallo al consultar la IA');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '⚠️ Ocurrió un error al procesar tu consulta. Intenta de nuevo.' },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, userEmail, origin, destination, incoterm, product, hsHint, language]
  );

  if (checking) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
          <h2 className="text-white text-2xl md:text-3xl font-bold">Asesoría Inteligente</h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Cargando…</div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
          <h2 className="text-white text-2xl md:text-3xl font-bold">Asesoría Premium</h2>
        </div>
        <div className="p-4 md:p-6">
          <p className="text-gray-700">
            Esta sección está disponible solo para usuarios Premium. Actualiza tu plan para acceder al chat IA especializado y agendar asesoría con nuestro equipo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Asesoría Inteligente en Comercio Exterior (IA)</h2>
        <p className="text-emerald-50 mt-1">
          Respuestas técnicas y accionables al instante, 24/7. Como Premium también puedes agendar con nuestro equipo (botón flotante).
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        {/* Contexto */}
        <Card
          title="Contexto de tu consulta"
          subtitle="Cuanto más específico, mejor: país de origen/destino, Incoterm, producto y pista HS."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">🌍</span>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
              >
                {COUNTRIES_LATAM.map((c) => (
                  <option key={`o-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País destino</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
              >
                {COUNTRIES_WORLD_COMMON.concat(COUNTRIES_LATAM).map((c) => (
                  <option key={`d-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incoterm</label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
              >
                {INCOTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ej. aguacate fresco, piezas automotrices"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pista HS / Fracción (opcional)</label>
              <input
                type="text"
                value={hsHint}
                onChange={(e) => setHsHint(e.target.value)}
                placeholder="Ej. 0804.40 (solo si la conoces)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
              />
            </div>
          </div>
        </Card>

        {/* Chat IA */}
        <Card
          title="Chat IA especializado"
          subtitle={userEmail ? `Sesión: ${userEmail}` : 'Sesión activa'}
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">💬</span>}
        >
          <div className="rounded-lg border border-gray-200 bg-white">
            <div ref={listRef} className="max-h-[380px] overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] md:max-w-[75%] whitespace-pre-wrap text-sm px-3 py-2 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-sm text-gray-500 flex items-center gap-2"><Spinner /> La IA está redactando…</div>}
            </div>

            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2 p-3 border-t border-gray-200">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta (describe tu caso)…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button onClick={() => sendMessage()} disabled={!canSend}>
                Enviar
              </Button>
            </div>

            {err && <div className="px-4 pb-3 text-xs text-red-600">{err}</div>}
          </div>
        </Card>

        <div className="text-sm text-gray-600">
          Como usuario Premium, cuentas con asesoría IA y puedes agendar con nuestro equipo usando el botón flotante de Calendly.
        </div>
      </div>
    </div>
  );
};

export default AsesoriaTab;

