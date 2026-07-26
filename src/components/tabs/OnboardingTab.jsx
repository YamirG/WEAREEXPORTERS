// src/components/tabs/OnboardingTab.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Card, Badge } from '../ui';

/**
 * OnboardingTab — guía paso a paso con progreso.
 *
 * Props:
 * - onGoTo?: (tabKey: string) => void
 * - userEmail?: string
 * - routes?: {
 *     pais: string;
 *     requisitos: string;
 *     rentabilidad: string;
 *     prospeccion: string;
 *     tramite: string;
 *   }
 */

const DEFAULT_ROUTES = {
  pais: 'consultas',
  requisitos: 'actualizaciones',
  rentabilidad: 'compradores',
  prospeccion: 'prospeccion',
  tramite: 'asesoria',
};

const STORAGE_KEY = 'onboarding_v1';

const BASE_STEPS = [
  {
    key: 'pais',
    title: 'Identificar países con demanda',
    desc:
      'Descubre qué países consumen tu producto y dónde hay mayor tracción. Empieza entendiendo la demanda y el tamaño del mercado.',
    cta: 'Ir ahora',
    done: false,
    icon: '🌎',
    tip: 'Empieza con 1–2 países y valida demanda antes de expandirte.',
  },
  {
    key: 'requisitos',
    title: 'Requisitos de exportación/importación',
    desc:
      'Valida requisitos para salir de tu país y entrar al destino: normas, permisos, etiquetado, certificaciones y aranceles.',
    cta: 'Ir ahora',
    done: false,
    icon: '📄',
    tip: 'Reúne HS/Fracción y verifica requisitos sanitarios, etiquetado y permisos.',
  },
  {
    key: 'rentabilidad',
    title: 'Validar rentabilidad',
    desc:
      'Valida si tu producto ya es comercializado en el país destino y revisa quién ya lo importa.',
    cta: 'Explorar',
    done: false,
    icon: '💵',
    tip: 'Observa a las empresas importadoras que ya lo hacen.',
  },
  {
    key: 'prospeccion',
    title: 'Prospección masiva en destino',
    desc:
      'Activa la prospección masiva: listas cualificadas, mensajes iniciales y seguimiento para convertir en ventas.',
    cta: 'Iniciar',
    done: false,
    icon: '👥',
    tip: 'Usa mensajes cortos y claros; mide respuesta y agenda reuniones.',
  },
  {
    key: 'tramite',
    title: 'Gestionar mi primer trámite',
    desc:
      'Acompañamiento para el primer envío: documentos, logística, Incoterm y coordinación con tu asesor.',
    cta: 'Agendar',
    done: false,
    icon: '✅',
    tip: 'Prepara documentos, precios, cotiza flete y coordina tu primer envío.',
  },
];

const StepStatus = ({ done, locked }) => {
  if (done) return <Badge variant="success">✓ Completado</Badge>;
  if (locked) return <Badge variant="neutral">🔒 Bloqueado</Badge>;
  return <Badge variant="neutral" className="bg-blue-50 text-blue-700">Disponible</Badge>;
};

const ProgressRing = ({ pct }) => {
  const normalized = Math.min(Math.max(pct, 0), 100);

  return (
    <div className="relative h-16 w-16">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#16A34A ${normalized * 3.6}deg, #E5E7EB 0deg)`,
        }}
      />
      <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
        <span className="text-sm font-extrabold text-green-700">{normalized}%</span>
      </div>
    </div>
  );
};

const OnboardingTab = ({ onGoTo, userEmail, routes = DEFAULT_ROUTES }) => {
  const [steps, setSteps] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length === BASE_STEPS.length) {
          return BASE_STEPS.map((s, i) => ({ ...s, done: !!saved[i]?.done }));
        }
      }
    } catch {}
    return BASE_STEPS;
  });

  useEffect(() => {
    try {
      const minimal = steps.map((s) => ({ key: s.key, done: s.done }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch {}
  }, [steps]);

  const completed = steps.filter((s) => s.done).length;
  const pct = useMemo(() => Math.round((completed / steps.length) * 100), [completed, steps.length]);

  const withLocks = useMemo(() => {
    return steps.map((s, idx) => {
      const locked = idx > 0 && !steps[idx - 1].done;
      return { ...s, locked };
    });
  }, [steps]);

  const markDone = useCallback((key, value = true) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, done: !!value } : s)));
  }, []);

  const resetProgress = useCallback(() => {
    setSteps((prev) => prev.map((s) => ({ ...s, done: false })));
  }, []);

  const getRouteFor = useCallback(
    (key) => {
      switch (key) {
        case 'pais':
          return routes.pais || DEFAULT_ROUTES.pais;
        case 'requisitos':
          return routes.requisitos || DEFAULT_ROUTES.requisitos;
        case 'rentabilidad':
          return routes.rentabilidad || DEFAULT_ROUTES.rentabilidad;
        case 'prospeccion':
          return routes.prospeccion || DEFAULT_ROUTES.prospeccion;
        case 'tramite':
          return routes.tramite || DEFAULT_ROUTES.tramite;
        default:
          return 'consultas';
      }
    },
    [routes]
  );

  const goTo = useCallback(
    (key) => {
      const tab = getRouteFor(key);
      if (typeof onGoTo === 'function') onGoTo(tab);
    },
    [getRouteFor, onGoTo]
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-green-100 blur-2xl opacity-70" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Premium</Badge>
                <span className="text-sm text-gray-500">Tu camino como exportador</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Bienvenido de nuevo 👋
              </h2>

              <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
                {userEmail
                  ? `Bienvenido/a, ${userEmail}. Sigue estos pasos para exportar con éxito y aprovechar todas las herramientas de WeAreExporters.`
                  : 'Sigue estos pasos para exportar con éxito y aprovechar todas las herramientas de WeAreExporters.'}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Tu progreso</p>
                <h3 className="text-3xl font-extrabold text-green-700 mt-1">{pct}%</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {completed} de {steps.length} pasos completados
                </p>
              </div>
              <ProgressRing pct={pct} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-gray-500">Siguiente acción recomendada</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              {withLocks.find((s) => !s.done && !s.locked)?.title || 'Ruta completada'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Avanza paso a paso para construir tu proceso exportador.
            </p>
          </Card>
        </div>
      </section>

      {/* Main layout */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Steps */}
        <Card className="xl:col-span-8 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">Tu ruta de exportación</h3>
              <p className="text-sm text-gray-500 mt-1">
                Completa cada paso para avanzar en tu camino como exportador profesional.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={resetProgress}>
              Reiniciar progreso
            </Button>
          </div>

          <div className="space-y-3">
            {withLocks.map((s, idx) => (
              <div
                key={s.key}
                className={`rounded-2xl border bg-white p-4 md:p-5 transition-all duration-200 min-h-[178px] ${
                  s.done
                    ? 'border-green-100 shadow-sm'
                    : s.locked
                    ? 'border-gray-200 opacity-75'
                    : 'border-blue-100 shadow-sm'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-[92px_minmax(0,1fr)_260px] gap-4 h-full">
                  {/* Columna izquierda */}
                  <div className="flex lg:flex-col items-center lg:items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                        s.done
                          ? 'bg-green-700 text-white'
                          : s.locked
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {s.done ? '✓' : idx + 1}
                    </div>

                    <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl shrink-0">
                      {s.icon}
                    </div>
                  </div>

                  {/* Columna información */}
                  <div className="min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-gray-900 leading-snug">
                        {s.title}
                      </h4>

                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        <span className="font-bold text-gray-700">Tip: </span>
                        {s.tip}
                      </p>
                    </div>
                  </div>

                  {/* Columna acciones */}
                  <div className="flex flex-col justify-center lg:items-stretch gap-2 lg:border-l lg:border-gray-100 lg:pl-5">
                    <div className="flex lg:justify-start">
                      <StepStatus done={s.done} locked={s.locked} />
                    </div>

                    <Button
                      variant={s.locked ? 'outline' : s.done ? 'outline' : 'secondary'}
                      size="sm"
                      disabled={s.locked}
                      onClick={() => goTo(s.key)}
                      className="w-full whitespace-nowrap"
                    >
                      {s.locked ? 'Próximamente' : s.cta} →
                    </Button>

                    {!s.done ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={s.locked}
                        onClick={() => markDone(s.key, true)}
                        className="w-full whitespace-nowrap"
                      >
                        Marcar ✓
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markDone(s.key, false)}
                        className="w-full whitespace-nowrap"
                      >
                        Desmarcar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <aside className="xl:col-span-4 space-y-5">
          <Card className="p-5">
            <h3 className="text-lg font-extrabold text-gray-900">Consejos para avanzar</h3>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-11 w-11 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-xl">
                  💡
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Empieza con un país</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Identifica un solo país con demanda real antes de expandirte.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
                  📘
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Revisa requisitos</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Los requisitos cambian constantemente. Mantente actualizado.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-11 w-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl">
                  🚀
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Prospecta con estrategia</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    La prospección funciona mejor con mensajes personalizados.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <h3 className="text-lg font-extrabold text-green-800">¿Necesitas ayuda?</h3>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              Nuestro equipo puede acompañarte en cada paso del proceso.
            </p>

            <div className="mt-4 grid gap-2">
              <Button
                variant="primary"
                onClick={() => (typeof onGoTo === 'function' ? onGoTo('asesoria') : null)}
              >
                Agendar asesoría
              </Button>

              <Button
                variant="outline"
                onClick={() => (typeof onGoTo === 'function' ? onGoTo('soporte') : null)}
              >
                Ir a soporte
              </Button>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
};

export default OnboardingTab;
