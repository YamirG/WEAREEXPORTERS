// src/components/tabs/OnboardingTab.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';

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

// Mini UI helpers
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}>{children}</div>
);

const Header = ({ title, subtitle }) => (
  <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
    <h2 className="text-white text-2xl md:text-3xl font-bold">{title}</h2>
    {subtitle && <p className="text-emerald-50 mt-1">{subtitle}</p>}
  </div>
);

const StepBadge = ({ n, done, locked }) => (
  <div
    className={
      'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ' +
      (done
        ? 'bg-emerald-600 text-white'
        : locked
        ? 'bg-gray-200 text-gray-500'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
    }
    title={done ? 'Completado' : locked ? 'Bloqueado' : 'Disponible'}
  >
    {done ? '✓' : n}
  </div>
);

const ProgressBar = ({ pct }) => (
  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
    <div
      className="h-full bg-emerald-500 transition-all"
      style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
    />
  </div>
);

const STORAGE_KEY = 'onboarding_v1';

const BASE_STEPS = [
  {
    key: 'pais',
    title: 'Identificar países con demanda',
    desc:
      'Descubre qué países consumen tu producto y dónde hay mayor tracción. Empieza entendiendo la demanda y el tamaño del mercado.',
    cta: 'Ir a detección de mercados',
    done: false,
  },
  {
    key: 'requisitos',
    title: 'Requisitos de exportación/importación',
    desc:
      'Valida requisitos para salir de tu país y entrar al destino (normas, permisos, etiquetado, certificaciones y aranceles).',
    cta: 'Ver normativa y cambios',
    done: false,
  },
  {
    key: 'rentabilidad',
    title: 'Validar rentabilidad',
    desc:
      'Valida si tu producto ya es comercializado en el país destino.',
    cta: 'Explorar quien ya lo importa',
    done: false,
  },
  {
    key: 'prospeccion',
    title: 'Prospección masiva en destino',
    desc:
      'Activa la prospección masiva: listas cualificadas, mensajes iniciales y seguimiento para convertir en ventas.',
    cta: 'Iniciar prospección',
    done: false,
  },
  {
    key: 'tramite',
    title: 'Gestionar mi primer trámite',
    desc:
      'Acompañamiento para el primer envío: documentos, logística, Incoterm y coordinación con tu asesor.',
    cta: 'Agendar asesoría / checklist',
    done: false,
  },
];

const OnboardingTab = ({ onGoTo, userEmail, routes = DEFAULT_ROUTES }) => {
  // 👇 Carga inicial desde localStorage SIN useEffect (evita el disable y el warning)
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

  // Guardar progreso cuando cambien los pasos
  useEffect(() => {
    try {
      const minimal = steps.map((s) => ({ key: s.key, done: s.done }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch {}
  }, [steps]);

  const completed = steps.filter((s) => s.done).length;
  const pct = useMemo(() => Math.round((completed / steps.length) * 100), [completed, steps.length]);

  // Bloqueo: cada paso se desbloquea cuando el anterior esté completo
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

  // ✅ Memoizamos getRouteFor y la usamos en goTo (sin warnings)
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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <Header
        title="Inicio Rápido — Tu ruta a la primera exportación"
        subtitle={
          userEmail
            ? `Bienvenido/a, ${userEmail}. Desbloquea cada paso y avanza hacia tu primer envío.`
            : 'Desbloquea cada paso y avanza hacia tu primer envío.'
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Progreso */}
        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-500">Progreso</div>
              <div className="text-lg font-semibold text-gray-800">{pct}% completado</div>
            </div>
            <button
              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
              onClick={resetProgress}
            >
              Reiniciar progreso
            </button>
          </div>
          <ProgressBar pct={pct} />
          <p className="text-xs text-gray-500 mt-2">
            Consejo: marca como completado cada paso una vez que termines su tarea principal.
          </p>
        </Card>

        {/* Pasos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {withLocks.map((s, idx) => (
            <Card key={s.key} className="p-4 md:p-5">
              <div className="flex items-start gap-3">
                <StepBadge n={idx + 1} done={s.done} locked={s.locked} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">
                        {s.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                    </div>
                    <span
                      className={
                        'text-xs px-2 py-1 rounded-full border ' +
                        (s.done
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.locked
                          ? 'bg-gray-50 text-gray-500 border-gray-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200')
                      }
                    >
                      {s.done ? 'Completado' : s.locked ? 'Bloqueado' : 'Disponible'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className={
                        'h-[40px] px-4 rounded-lg text-sm font-medium ' +
                        (s.locked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white')
                      }
                      disabled={s.locked}
                      onClick={() => goTo(s.key)}
                    >
                      {s.cta}
                    </button>

                    {!s.done ? (
                      <button
                        className={
                          'h-[40px] px-3 rounded-lg text-sm ' +
                          (s.locked
                            ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700')
                        }
                        disabled={s.locked}
                        onClick={() => markDone(s.key, true)}
                      >
                        Marcar como completado
                      </button>
                    ) : (
                      <button
                        className="h-[40px] px-3 rounded-lg text-sm bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                        onClick={() => markDone(s.key, false)}
                      >
                        Desmarcar
                      </button>
                    )}
                  </div>

                  {/* Tips contextuales */}
                  {s.key === 'pais' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Tip: empieza con 1–2 países. Puedes pedirle en el Chat IA un resumen rápido
                      de “dónde crece la demanda de &lt;tu producto&gt;”.
                    </p>
                  )}
                  {s.key === 'requisitos' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reúne HS/Fracción y verifica requisitos sanitarios/fitosanitarios, etiquetado y permisos.
                    </p>
                  )}
                  {s.key === 'rentabilidad' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Observa a las empresas importadores que ya lo hacen.
                    </p>
                  )}
                  {s.key === 'prospeccion' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Usa mensajes cortos y claros; mide respuesta y agenda reuniones para cerrar ventas.
                    </p>
                  )}
                  {s.key === 'tramite' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Prepara documentos, precios, cotiza flete y coordina tu primer envío con el asesor.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bloque final de ayuda */}
        <Card className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-base md:text-lg font-semibold text-gray-800">
                ¿Necesitas ayuda para avanzar?
              </div>
              <div className="text-sm text-gray-600">
                Puedes abrir un ticket en <span className="font-medium">Soporte</span> o agendar con el equipo.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 h-[40px] rounded-lg text-sm bg-white border border-gray-200 hover:bg-gray-50"
                onClick={() => (typeof onGoTo === 'function' ? onGoTo('soporte') : null)}
              >
                Ir a Soporte
              </button>
              <button
                className="px-4 h-[40px] rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => (typeof onGoTo === 'function' ? onGoTo('asesoria') : null)}
              >
                Agendar asesoría
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingTab;
