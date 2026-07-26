import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Button, Card, Badge, Input, Select, Alert, Loader } from '../ui';

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

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-700" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
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
  const [language, setLanguage] = useState('es');

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
      <Card className="p-6">
        <Loader text="Cargando asesoría inteligente…" />
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <Card className="p-6 md:p-8">
        <Badge variant="warning">Acceso restringido</Badge>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-4">
          Asesoría Premium
        </h2>
        <p className="text-gray-600 mt-3 leading-relaxed max-w-2xl">
          Esta sección está disponible solo para usuarios Premium. Actualiza tu plan para acceder al chat IA especializado y agendar asesoría con nuestro equipo.
        </p>
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
                <Badge variant="success">Asesor IA</Badge>
                <span className="text-sm text-gray-500">
                  Comercio exterior especializado
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Asesoría inteligente en comercio exterior
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Resuelve dudas técnicas de exportación, Incoterms, trámites, precios,
                clasificación arancelaria y estrategia internacional. Como usuario Premium
                también puedes agendar una videollamada con nuestro equipo.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">IA especializada</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-1">24/7</h3>
            <p className="text-sm text-gray-500 mt-1">
              Respuestas accionables cuando las necesites.
            </p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Videollamada</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              Asesoría Premium
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Usa el botón flotante de Calendly para agendar con el equipo.
            </p>
          </Card>
        </div>
      </section>

      {/* Context + Chat */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Contexto */}
        <aside className="xl:col-span-4 space-y-5">
          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-xl">
                🌎
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Contexto de consulta
                </h3>
                <p className="text-sm text-gray-500">
                  Ajusta el escenario antes de preguntar.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Select
                label="País de origen"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                {COUNTRIES_LATAM.map((c) => (
                  <option key={`o-${c}`} value={c}>{c}</option>
                ))}
              </Select>

              <Select
                label="País destino"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {COUNTRIES_WORLD_COMMON.concat(COUNTRIES_LATAM).map((c) => (
                  <option key={`d-${c}`} value={c}>{c}</option>
                ))}
              </Select>

              <Select
                label="Incoterm"
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
              >
                {INCOTERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>

              <Input
                label="Producto"
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ej. aguacate fresco, piezas automotrices"
              />

              <Input
                label="Pista HS / Fracción"
                type="text"
                value={hsHint}
                onChange={(e) => setHsHint(e.target.value)}
                placeholder="Ej. 0804.40"
              />
            </div>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <Badge variant="success">Contexto activo</Badge>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Ruta</span>
                <span className="font-bold text-gray-900 text-right">{origin} → {destination}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Incoterm</span>
                <span className="font-bold text-gray-900">{incoterm}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Producto</span>
                <span className="font-bold text-gray-900 text-right">{product || 'Sin definir'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-extrabold text-gray-900">Preguntas rápidas</h3>
            <p className="text-sm text-gray-500 mt-1">
              Usa una de estas consultas para comenzar.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_EXAMPLES.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-700 px-3 py-2 text-xs font-semibold text-gray-600 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Chat IA */}
        <div className="xl:col-span-8">
          <Card className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#045023] text-white flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="success">Chat IA especializado</Badge>
                      <span className="text-xs text-gray-400">
                        {userEmail ? `Sesión: ${userEmail}` : 'Sesión activa'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                      Copilot de exportación
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Describe tu caso y recibe una respuesta técnica y accionable.
                    </p>
                  </div>
                </div>

                <Badge variant="premium">Premium</Badge>
              </div>
            </div>

            <div className="bg-gray-50">
              <div
                ref={listRef}
                className="h-[520px] max-h-[65vh] overflow-y-auto px-4 md:px-6 py-5 space-y-4"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[92%] md:max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                        m.role === 'user'
                          ? 'bg-[#045023] text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold opacity-80">
                          {m.role === 'user' ? 'Tú' : 'Asesor IA'}
                        </span>
                      </div>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[92%] md:max-w-[78%] rounded-3xl rounded-bl-md bg-white border border-gray-100 px-4 py-3 text-sm text-gray-600 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Spinner />
                        Analizando tu caso y preparando respuesta…
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-4">
                {err && (
                  <div className="mb-3">
                    <Alert variant="danger">{err}</Alert>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                  <textarea
                    rows={3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta. Ej. Quiero exportar aguacate de México a Estados Unidos bajo FOB..."
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
                  />

                  <Button
                    onClick={() => sendMessage()}
                    disabled={!canSend}
                    className="w-full md:w-auto"
                  >
                    {loading ? 'Enviando…' : 'Enviar'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Tip: entre más contexto proporciones, más útil será la respuesta del asesor IA.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Alert variant="success">
        Como usuario Premium, cuentas con asesoría IA y puedes agendar con nuestro equipo usando el botón flotante de Calendly.
      </Alert>
    </div>
  );
};

export default AsesoriaTab;
