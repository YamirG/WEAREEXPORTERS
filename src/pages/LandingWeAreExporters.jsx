// src/pages/LandingWeAreExporters.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";

const isYouTube = (url = "") =>
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url);

const isVimeo = (url = "") => /vimeo\.com\/\d+/i.test(url);

function getYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
}

function getVimeoEmbed(url) {
  const match = (url || "").match(/vimeo\.com\/(\d+)/i);
  return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : "";
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad2 = (n) => String(n).padStart(2, "0");
  return { days, hours: pad2(hours), minutes: pad2(minutes), seconds: pad2(seconds) };
}

export default function LandingWeAreExporters() {
  const navigate = useNavigate();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // ✅ VIDEO CONTROLADO SOLO DESDE CÓDIGO (el usuario no lo puede cambiar)
  const VIDEO_URL = "https://youtu.be/mXlOU1amf_8";

  const embedSrc = useMemo(() => {
    if (!VIDEO_URL) return "";
    if (isYouTube(VIDEO_URL)) return getYouTubeEmbed(VIDEO_URL);
    if (isVimeo(VIDEO_URL)) return getVimeoEmbed(VIDEO_URL);
    return "";
  }, [VIDEO_URL]);

  const isDirectMp4 = useMemo(() => /\.mp4(\?.*)?$/i.test(VIDEO_URL || ""), [
    VIDEO_URL,
  ]);

  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);

  // ✅ TEMPORIZADOR: 1 día en cuenta regresiva (días/horas/min/seg)
  const [deadline] = useState(() => Date.now() + 24 * 60 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(() => deadline - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setRemainingMs(deadline - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  const t = formatCountdown(remainingMs);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Fondo suave + detalles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-15%] h-[560px] w-[560px] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-green-50/40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            aria-label="Ir a WeAreExporters"
          >
            {/* ✅ Se quitó el bloque verde del logo (placeholder) */}
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">
                WeAreExporters
              </div>
              <div className="text-xs text-gray-500">Premium</div>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Ir a la plataforma
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-green-700"
            >
              Registrarme
            </button>
          </div>

          {/* CTA móvil */}
          <button
            type="button"
            onClick={openRegister}
            className="md:hidden rounded-xl bg-green-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-green-700"
          >
            Registrarme
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              ✅ 7 días de Prueba Gratis en Premium
            </span>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
              Exporta con estrategia, requisitos claros y prospectos reales.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              WeAreExporters te guía para llevar tu producto a mercados
              internacionales: identifica demanda, entiende requisitos y activa
              prospección para encontrar compradores.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openRegister}
                className="rounded-2xl bg-green-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-green-700"
              >
                Crear cuenta premium
              </button>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("demo")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50"
              >
                Ver demo en video
              </button>
            </div>

            {/* Chips */}
            <div className="mt-6 flex flex-wrap gap-2">
             
            </div>

            {/* Confianza */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat k="+Velocidad" v="Decisiones en minutos" />
              <Stat k="+Claridad" v="Pasos y requisitos" />
              <Stat k="+Ventas" v="Prospectos constantes" />
            </div>
          </div>

          {/* Card derecha */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900">
                ¿Para quién es?
              </h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Productor/Emprendedor
              </span>
            </div>

            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check />
                Productores, agroindustria y alimentos
              </li>
              <li className="flex items-start gap-2">
                <Check />
                Marcas listas para exportar o crecer
              </li>
              <li className="flex items-start gap-2">
                <Check />
                Comercializadoras y export managers
              </li>
              <li className="flex items-start gap-2">
                <Check />
                Manufactura ligera y productos de consumo
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="text-sm font-extrabold text-green-800">
                Desbloquea el Potencial de tu Producto
              </div>
              <p className="mt-1 text-sm text-green-800/90">
                Con o Sin Experiencia WeAreExporters te Guía Paso a Paso
              </p>
            </div>

            <button
              type="button"
              onClick={openRegister}
              className="mt-6 w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-green-700"
            >
              Registrarme ahora
            </button>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section id="demo" className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 md:text-2xl">
                Demo en video
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Te mostramos cómo funciona WeAreExporters en la práctica.
              </p>
            </div>

            <button
              type="button"
              onClick={openRegister}
              className="hidden rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-green-700 md:inline-flex"
            >
              Registrarme
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
            {isDirectMp4 ? (
              <video controls className="aspect-video w-full">
                <source src={VIDEO_URL} type="video/mp4" />
                Tu navegador no soporta video MP4.
              </video>
            ) : embedSrc ? (
              <div className="aspect-video w-full">
                <iframe
                  title="WeAreExporters Demo"
                  src={embedSrc}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-6 text-sm text-gray-600">
                Video no configurado. Actualiza <strong>VIDEO_URL</strong> en el
                código fuente.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 md:text-3xl">
            Todo el flujo de exportación en una sola plataforma
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
            Desde entender mercados y requisitos, hasta generar prospectos para
            cerrar ventas internacionales.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Mercados con demanda"
            desc="Descubre países donde tu producto tiene mayor consumo y oportunidad real."
          />
          <Feature
            title="Requisitos y tramitología"
            desc="Requisitos clave para exportar/importar, en formato claro y accionable."
          />
          <Feature
            title="Prospección masiva"
            desc="Genera compradores internacionales de forma continua (tú solo cierras)."
          />
          <Feature
            title="Consultas ilimitadas"
            desc="Resuelve dudas rápido y toma decisiones con seguridad."
          />
          <Feature
            title="Capacitación continua"
            desc="Cursos, talleres y guías para convertirte en exportador profesional."
          />
          <Feature
            title="Soporte y actualizaciones"
            desc="Mantente al día con cambios, noticias y oportunidades globales."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="rounded-3xl bg-gradient-to-br from-green-600 to-emerald-500 p-6 text-white shadow-sm md:p-10">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="text-2xl font-black md:text-3xl">
                Activa tu cuenta Premium hoy
              </h3>
              <p className="mt-2 text-sm text-white/90 md:text-base">
                Prueba 7 días gratis. Si te hace sentido, te quedas. Si no, lo
                cancelas.
              </p>

              {/* ✅ BLOQUE NUEVO: Temporizador (1 día) — diseño ad hoc */}
              <div className="mt-5 inline-flex flex-col gap-2 rounded-2xl bg-white/10 p-4 ring-1 ring-white/25 backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M12 8v5l3 2"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div className="text-sm font-extrabold">
                    Promoción (termina pronto)
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <TimeBox label="Días" value={String(t.days)} />
                  <TimeBox label="Horas" value={t.hours} />
                  <TimeBox label="Min" value={t.minutes} />
                  <TimeBox label="Seg" value={t.seconds} />
                </div>

                <div className="text-xs text-white/85">
                  
                </div>
              </div>
              {/* ✅ FIN TEMPORIZADOR */}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/30 hover:bg-white/15"
              >
                Ver plataforma
              </button>
              <button
                type="button"
                onClick={openRegister}
                className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-green-700 hover:bg-green-50"
              >
                Registrarme ahora
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} WeAreExporters — Todos los derechos
          reservados.
        </p>
      </section>

      {/* ✅ Modal real */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeRegister}
        onSwitchToLogin={() => {
          closeRegister();
          navigate("/"); // fallback: abre login desde plataforma
        }}
      />

      {/* Sticky CTA móvil */}
      <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto flex max-w-6xl px-4 md:hidden">
        <button
          type="button"
          onClick={openRegister}
          className="w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-green-600/20 hover:bg-green-700"
        >
          Registrarme (7 días gratis)
        </button>
      </div>
    </div>
  );
}

/* UI atoms */
function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700">
      {children}
    </span>
  );
}

function Stat({ k, v }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-extrabold text-green-700">{k}</div>
      <div className="mt-1 text-sm font-bold text-gray-900">{v}</div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-10 w-10 rounded-2xl bg-green-50 ring-1 ring-green-200 flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-gray-900">{title}</div>
          <div className="mt-1 text-sm text-gray-600 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ✅ UI del contador */
function TimeBox({ label, value }) {
  return (
    <div className="min-w-[74px] rounded-2xl bg-white px-3 py-2 text-center text-green-800 shadow-sm">
      <div className="text-2xl font-black leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-green-700/80">
        {label}
      </div>
    </div>
  );
}
