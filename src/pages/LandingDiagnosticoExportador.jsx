// src/pages/LandingDiagnosticoExportador.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import RegisterModal from "../components/RegisterModal";

import {
  getTopConsumers,
  getRequirements,
  getBuyers,
  isHSLike,
} from "../services/consultaIA";

const ADMIN_EMAIL = "yamirguillenr@gmail.com";
const VIDEO_URL_DEFAULT = "https://youtu.be/bBUlYviB_7k";
const FREE_DIAGNOSTIC_STORAGE_KEY =
  "weareexporters_free_diagnostic_used";

// Datos de contacto del footer. Sustituye únicamente el teléfono y enlaces
// cuando tengas las URLs definitivas de tus redes sociales.
const CONTACT_EMAIL = "somosexportadoresmx@gmail.com";
const CONTACT_PHONE_DISPLAY = "+52 55 7416 9768";
const CONTACT_PHONE_LINK = "+525574169768";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/14cFVcB1kPz/",
  },
];


const FAQ_ITEMS = [
  {
    question: "¿Qué incluye la prueba gratuita de 7 días?",
    answer:
      "Durante 7 días tendrás acceso al Panel Premium de WeAreExporters para explorar sus herramientas de consulta, análisis de mercados, requisitos, capacitación, soporte y prospección internacional, de acuerdo con las condiciones vigentes de tu plan.",
  },
  {
    question: "¿Cuándo se realiza el primer cobro?",
    answer:
      "El primer cargo se realiza automáticamente al terminar los 7 días de prueba. El método de pago que registres quedará asociado a la suscripción.",
  },
  {
    question: "¿Puedo cancelar antes de que termine la prueba?",
    answer:
      "Sí. Puedes cancelar antes de que concluyan los 7 días para evitar el primer cargo, de lo contrario una vez hecho el cobro no se podra realizar reembolso de acuerdo con el proceso de cancelación mostrado durante tu registro.",
  },
  {
    question: "¿Necesito experiencia previa en exportaciones?",
    answer:
      "No. La plataforma está diseñada para ayudarte a ordenar la información y avanzar paso a paso, incluso si todavía no has realizado tu primera exportación.",
  },
  {
    question: "¿Solo es para México?",
    answer:
      "No, la plataforma esta enfocandose para que cualquier país de LatinoAmerica logre exportar.",
  },
  {
    question: "¿Cómo encuentra compradores WeAreExporters?",
    answer:
      "La plataforma utiliza herramientas de IA (Inteligencia Artificial) para búsqueda, análisis y prospección internacional.",
  },
  {
    question: "¿Los resultados garantizan una venta?",
    answer:
      "No. WeAreExporters facilita investigación, requisitos y genera prospección (compradores potenciales), pero el cierre de venta y negociación aún depende 100% del usuario premium ya que se busca evitar la intermediación.",
  },
  {
    question: "¿Necesito instalar algún programa?",
    answer:
      "No. Puedes utilizar la plataforma desde un navegador o móvil con conexión a internet.",
  },
];

const COUNTRY_LIST = [
  "México",
  "Estados Unidos",
  "Canadá",
  "Brasil",
  "Argentina",
  "Chile",
  "Colombia",
  "Perú",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "Ecuador",
  "Costa Rica",
  "Panamá",
  "Guatemala",
  "Honduras",
  "El Salvador",
  "Nicaragua",
  "República Dominicana",
  "España",
  "Francia",
  "Alemania",
  "Italia",
  "Reino Unido",
  "Países Bajos",
  "Bélgica",
  "Portugal",
  "Suecia",
  "Noruega",
  "Dinamarca",
  "Irlanda",
  "Suiza",
  "China",
  "Japón",
  "Corea del Sur",
  "India",
  "Singapur",
  "Tailandia",
  "Vietnam",
  "Indonesia",
  "Malasia",
  "Filipinas",
  "Australia",
  "Nueva Zelanda",
  "Emiratos Árabes Unidos",
  "Arabia Saudita",
  "Qatar",
  "Kuwait",
  "Turquía",
  "Israel",
  "Sudáfrica",
  "Egipto",
  "Marruecos",
];

function getYouTubeEmbed(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    }

    const videoId = parsedUrl.searchParams.get("v");

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : "";
  } catch {
    return "";
  }
}

export default function LandingDiagnosticoExportador() {
  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState("");
  const [videoUrl, setVideoUrl] = useState(VIDEO_URL_DEFAULT);

  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showFreeLimitModal, setShowFreeLimitModal] =
    useState(false);

  // Datos iniciales
  const [producto, setProducto] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("México");

  // El destino se selecciona después de descubrir los mercados
  const [paisDestino, setPaisDestino] = useState("");

  // Estados del análisis de mercados
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [marketResult, setMarketResult] = useState(null);

  // Estados del análisis del país seleccionado
  const [destinationLoading, setDestinationLoading] =
    useState(false);

  const [destinationError, setDestinationError] =
    useState("");

  const [destinationResult, setDestinationResult] =
    useState(null);

  const embedSrc = useMemo(
    () => getYouTubeEmbed(videoUrl),
    [videoUrl]
  );

  const isAdmin =
    adminEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const hsIsValid = isHSLike(hsCode);

  const discoveredCountries = useMemo(() => {
    const rows = marketResult?.paisesConsumidores;

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows
      .map((row) => String(row?.country || "").trim())
      .filter(Boolean);
  }, [marketResult]);

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        const { data, error } =
          await supabase.auth.getUser();

        if (error) {
          console.warn(
            "No se pudo verificar el usuario administrador:",
            error
          );

          return;
        }

        if (isMounted) {
          setAdminEmail(data?.user?.email || "");
        }
      } catch (error) {
        console.warn(
          "Error verificando usuario administrador:",
          error
        );
      }
    };

    getUser();

    const timer = window.setTimeout(() => {
      if (isMounted) {
        setShowDiagnostic(true);
      }
    }, 60000);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const openRegister = () => {
    setIsRegisterOpen(true);
  };

  const closeRegister = () => {
    setIsRegisterOpen(false);
  };

  const hasUsedFreeDiagnostic = () => {
    try {
      return (
        window.localStorage.getItem(
          FREE_DIAGNOSTIC_STORAGE_KEY
        ) === "true"
      );
    } catch (error) {
      console.warn(
        "No fue posible consultar el límite gratuito:",
        error
      );

      return false;
    }
  };

  const markFreeDiagnosticAsUsed = () => {
    try {
      window.localStorage.setItem(
        FREE_DIAGNOSTIC_STORAGE_KEY,
        "true"
      );
    } catch (error) {
      console.warn(
        "No fue posible guardar el uso del diagnóstico gratuito:",
        error
      );
    }
  };

  const openFreeLimitModal = () => {
    setShowFreeLimitModal(true);
  };

  const closeFreeLimitModal = () => {
    setShowFreeLimitModal(false);
  };

  const openRegisterFromFreeLimit = () => {
    setShowFreeLimitModal(false);
    setIsRegisterOpen(true);
  };

  /*
   * ETAPA 1
   *
   * Descubrir qué países consumen el producto.
   * Aquí todavía no se pide país destino.
   */
  const runMarketDiagnostic = async () => {
    if (hasUsedFreeDiagnostic()) {
      openFreeLimitModal();
      return;
    }

    setMarketError("");
    setDestinationError("");
    setMarketResult(null);
    setDestinationResult(null);
    setPaisDestino("");

    const cleanProduct = producto.trim();
    const cleanHsCode = hsCode.trim();

    if (!cleanProduct) {
      setMarketError(
        "Ingresa el nombre del producto que quieres analizar."
      );

      return;
    }

    if (!isHSLike(cleanHsCode)) {
      setMarketError(
        "Ingresa una fracción arancelaria válida de entre 6 y 10 dígitos."
      );

      return;
    }

    if (!paisOrigen) {
      setMarketError("Selecciona el país de origen.");
      return;
    }

    try {
      setMarketLoading(true);

      const topConsumersData =
        await getTopConsumers(cleanHsCode);

      const topConsumers = Array.isArray(
        topConsumersData?.rows
      )
        ? topConsumersData.rows.slice(0, 10)
        : [];

      setMarketResult({
        producto: cleanProduct,
        hsCode: cleanHsCode,
        paisOrigen,
        paisesConsumidores: topConsumers,
      });

      window.setTimeout(() => {
        document
          .getElementById("mercados-descubiertos")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (error) {
      console.error(
        "Error descubriendo mercados:",
        error
      );

      setMarketError(
        getFriendlyErrorMessage(error)
      );
    } finally {
      setMarketLoading(false);
    }
  };

  /*
   * ETAPA 2
   *
   * Después de mostrar el Top 10, el usuario selecciona
   * un destino. Solo entonces se consultan requisitos
   * y compradores.
   */
  const runDestinationDiagnostic = async () => {
    if (hasUsedFreeDiagnostic()) {
      openFreeLimitModal();
      return;
    }

    setDestinationError("");
    setDestinationResult(null);

    if (!marketResult) {
      setDestinationError(
        "Primero debes generar el análisis de mercados."
      );

      return;
    }

    if (!paisDestino) {
      setDestinationError(
        "Selecciona uno de los países consumidores para continuar."
      );

      return;
    }

    try {
      setDestinationLoading(true);

      const responses = await Promise.allSettled([
        getRequirements({
          hsCode: marketResult.hsCode,
          originCountry: marketResult.paisOrigen,
          destinationCountry: paisDestino,
        }),

        getBuyers({
          hsCode: marketResult.hsCode,
          destinationCountry: paisDestino,
        }),
      ]);

      const [
        requirementsResponse,
        buyersResponse,
      ] = responses;

      const requirementsData =
        requirementsResponse.status === "fulfilled"
          ? requirementsResponse.value
          : null;

      const buyersData =
        buyersResponse.status === "fulfilled"
          ? buyersResponse.value
          : null;

      const requirementsError =
        requirementsResponse.status === "rejected"
          ? getErrorMessage(
              requirementsResponse.reason
            )
          : "";

      const buyersError =
        buyersResponse.status === "rejected"
          ? getErrorMessage(buyersResponse.reason)
          : "";

      const allFailed =
        requirementsResponse.status === "rejected" &&
        buyersResponse.status === "rejected";

      if (allFailed) {
        throw new Error(
          requirementsError ||
            buyersError ||
            "No fue posible completar el análisis del país seleccionado."
        );
      }

      const compradores = Array.isArray(
        buyersData?.rows
      )
        ? buyersData.rows.slice(0, 10)
        : [];

      setDestinationResult({
        paisDestino,

        requisitos: {
          exportRequirements: Array.isArray(
            requirementsData?.export_requirements
          )
            ? requirementsData.export_requirements
            : [],

          importRequirements: Array.isArray(
            requirementsData?.import_requirements
          )
            ? requirementsData.import_requirements
            : [],

          nonTariffMeasures: Array.isArray(
            requirementsData?.nTM
          )
            ? requirementsData.nTM
            : [],

          references: Array.isArray(
            requirementsData?.references
          )
            ? requirementsData.references
            : [],
        },

        compradores,

        partialErrors: {
          requirements: requirementsError,
          buyers: buyersError,
        },

        analisisIA: createStrategicSummary({
          producto: marketResult.producto,
          hsCode: marketResult.hsCode,
          paisOrigen: marketResult.paisOrigen,
          paisDestino,
          compradores,
        }),
      });

      markFreeDiagnosticAsUsed();

      window.setTimeout(() => {
        document
          .getElementById("analisis-destino")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (error) {
      console.error(
        "Error analizando el destino:",
        error
      );

      setDestinationError(
        getFriendlyErrorMessage(error)
      );
    } finally {
      setDestinationLoading(false);
    }
  };

  const selectDestination = (country) => {
    setPaisDestino(country);
    setDestinationError("");
    setDestinationResult(null);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white pb-24 text-gray-900 md:pb-0">
      {/* Fondo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-15%] h-[560px] w-[560px] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-green-50/40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="min-w-0 text-left leading-tight"
          >
            <div className="truncate text-sm font-extrabold tracking-tight sm:text-base">
              WeAreExporters
            </div>

            <div className="hidden text-xs text-gray-500 sm:block">
              Diagnóstico exportador
            </div>
          </button>

          <button
            type="button"
            onClick={openRegister}
            className="min-h-[44px] shrink-0 rounded-xl bg-green-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-green-700 sm:px-4 sm:text-sm"
          >
            Registrarme
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-14">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            Diagnóstico gratuito
          </span>

          <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Descubre qué países consumen tu producto, qué
            necesitas para exportarlo y a quién podrías
            venderle.
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
            Primero descubriremos los mercados con mayor
            potencial. Después podrás seleccionar un país para
            conocer sus requisitos y posibles compradores.
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
          {/* Panel administrativo oculto del sitio público.
              Se conserva intacta la lógica relacionada para no afectar
              ninguna otra función existente. */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:rounded-3xl">
            {embedSrc ? (
              <div className="aspect-video w-full">
                <iframe
                  title="Video diagnóstico exportador"
                  src={embedSrc}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                Video no configurado.
              </div>
            )}
          </div>

          {!showDiagnostic && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm font-bold text-amber-800">
                Mira primero el video.
              </p>

              <p className="mt-1 text-xs text-amber-700">
                El diagnóstico se activará después de un minuto.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Todo el contenido posterior al video se activa después de un minuto */}
      {showDiagnostic && (
        <>
          {/* Formulario inicial */}
          <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 md:pt-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Primera etapa
              </span>

              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                Descubre qué países consumen tu producto
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                No necesitas elegir un país destino. La IA
                analizará tu producto y te mostrará los diez
                mercados consumidores más relevantes.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <InfoQuestionCard
                number="1"
                icon="🌍"
                title="Descubre los mercados"
                desc="Obtén el Top 10 de países consumidores de tu producto."
              />

              <InfoQuestionCard
                number="2"
                icon="🎯"
                title="Selecciona una oportunidad"
                desc="Elige uno de los mercados identificados por la IA."
              />

              <InfoQuestionCard
              number="3"
                icon="🏢"
                title="Profundiza el análisis"
                desc="Consulta requisitos y compradores del país seleccionado."
              />
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:mt-8 sm:rounded-3xl sm:p-5 md:p-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="diagnostic-product"
                    className="text-sm font-extrabold text-gray-900"
                  >
                    Producto a analizar
                  </label>

                  <input
                    id="diagnostic-product"
                    type="text"
                    value={producto}
                    onChange={(event) =>
                      setProducto(event.target.value)
                    }
                    placeholder="Ej. nuez, vainilla, café, mezcal..."
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="diagnostic-hs"
                    className="text-sm font-extrabold text-gray-900"
                  >
                    Fracción arancelaria HS
                  </label>

                  <input
                    id="diagnostic-hs"
                    type="text"
                    inputMode="numeric"
                    value={hsCode}
                    onChange={(event) =>
                      setHsCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="Ej. 08044010"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                  {hsCode && (
                    <div className="mt-2">
                      {hsIsValid ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                          Fracción HS válida
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                          Debe contener de 6 a 10 dígitos
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="diagnostic-origin"
                    className="text-sm font-extrabold text-gray-900"
                  >
                    País de origen
                  </label>

                  <select
                    id="diagnostic-origin"
                    value={paisOrigen}
                    onChange={(event) =>
                      setPaisOrigen(event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  >
                    {COUNTRY_LIST.map((country) => (
                      <option
                        key={`origin-${country}`}
                        value={country}
                      >
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {marketError && (
                <ErrorNotice message={marketError} />
              )}

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={runMarketDiagnostic}
                  disabled={
                    marketLoading ||
                    !producto.trim() ||
                    !hsIsValid
                  }
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                >
                  {marketLoading ? (
                    <>
                      <Spinner />
                      Descubriendo mercados...
                    </>
                  ) : (
                    <>Descubrir países consumidores</>
                  )}
                </button>
              </div>
            </div>
          </div>
          </section>

          {/* Mercados descubiertos */}
      {marketResult && (
        <section
          id="mercados-descubiertos"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-10 sm:px-6 md:pt-12"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Mercados descubiertos
              </span>

              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                Países que consumen {marketResult.producto}
              </h2>

              <p className="mx-auto mt-2 max-w-3xl text-sm text-gray-600">
                Fracción HS:{" "}
                <strong>{marketResult.hsCode}</strong>
                {" · "}
                País de origen:{" "}
                <strong>{marketResult.paisOrigen}</strong>
              </p>
            </div>

            <div className="mt-8">
              <VisualBlock
                number="1"
                icon="🌍"
                title="¿Qué países consumen tu producto? Top 10"
                subtitle="Selecciona el mercado que quieras investigar."
              >
                {marketResult.paisesConsumidores.length >
                0 ? (
                  <>
                    <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch]">
                      <table className="min-w-[760px] divide-y divide-gray-200 md:min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <TableHeader>
                              Seleccionar
                            </TableHeader>

                            <TableHeader>
                              Posición
                            </TableHeader>

                            <TableHeader>País</TableHeader>

                            <TableHeader>
                              Importaciones
                            </TableHeader>

                            <TableHeader>
                              Participación
                            </TableHeader>

                            <TableHeader>Notas</TableHeader>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white">
                          {marketResult.paisesConsumidores.map(
                            (row, index) => {
                              const country =
                                row?.country || "";

                              const isSelected =
                                paisDestino === country;

                              return (
                                <tr
                                  key={`consumer-${
                                    country || index
                                  }`}
                                  className={`cursor-pointer transition ${
                                    isSelected
                                      ? "bg-green-50"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() =>
                                    selectDestination(
                                      country
                                    )
                                  }
                                >
                                  <TableCell>
                                    <input
                                      type="radio"
                                      name="selected-destination"
                                      checked={isSelected}
                                      onChange={() =>
                                        selectDestination(
                                          country
                                        )
                                      }
                                      aria-label={`Seleccionar ${country}`}
                                      className="h-4 w-4 accent-green-600"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-black text-green-700">
                                      {index + 1}
                                    </span>
                                  </TableCell>

                                  <TableCell strong>
                                    {country ||
                                      "Sin dato"}
                                  </TableCell>

                                  <TableCell>
                                    {row?.import_value ||
                                      "No disponible"}
                                  </TableCell>

                                  <TableCell>
                                    {row?.share ||
                                      "No disponible"}
                                  </TableCell>

                                  <TableCell>
                                    {row?.notes || "—"}
                                  </TableCell>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5">
                      <label
                        htmlFor="selected-market"
                        className="text-sm font-extrabold text-green-900"
                      >
                        Mercado que deseas investigar
                      </label>

                      <select
                        id="selected-market"
                        value={paisDestino}
                        onChange={(event) =>
                          selectDestination(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 md:max-w-xl"
                      >
                        <option value="">
                          Selecciona uno de los países encontrados
                        </option>

                        {discoveredCountries.map(
                          (country) => (
                            <option
                              key={`market-${country}`}
                              value={country}
                            >
                              {country}
                            </option>
                          )
                        )}
                      </select>

                      <p className="mt-2 text-xs leading-relaxed text-green-800">
                        Después analizaremos qué necesitas para
                        exportar a ese país y qué empresas podrían
                        comprar tu producto.
                      </p>
                    </div>

                    {destinationError && (
                      <ErrorNotice
                        message={destinationError}
                      />
                    )}

                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={
                          runDestinationDiagnostic
                        }
                        disabled={
                          destinationLoading ||
                          !paisDestino
                        }
                        className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                      >
                        {destinationLoading ? (
                          <>
                            <Spinner />
                            Analizando {paisDestino}...
                          </>
                        ) : (
                          <>
                            Analizar requisitos y
                            compradores
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <EmptyResult message="No se encontraron mercados consumidores para esta fracción arancelaria." />
                )}
              </VisualBlock>
            </div>
          </div>
        </section>
      )}

      {/* Análisis del destino */}
      {destinationResult && marketResult && (
        <section
          id="analisis-destino"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-10 sm:px-6 md:pt-12"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Segunda etapa
              </span>

              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                Oportunidad de exportación hacia{" "}
                {destinationResult.paisDestino}
              </h2>

              <p className="mx-auto mt-2 max-w-3xl text-sm text-gray-600">
                Producto:{" "}
                <strong>
                  {marketResult.producto}
                </strong>
                {" · "}
                Origen:{" "}
                <strong>
                  {marketResult.paisOrigen}
                </strong>
                {" · "}
                Destino:{" "}
                <strong>
                  {destinationResult.paisDestino}
                </strong>
              </p>
            </div>

            {/* Requisitos */}
            <div className="mt-8">
              <VisualBlock
                number="2"
                icon="📦"
                title="Requisitos para exportar e importar"
                subtitle={`Salida desde ${marketResult.paisOrigen} y entrada a ${destinationResult.paisDestino}.`}
              >
                {destinationResult.partialErrors
                  .requirements ? (
                  <PartialError
                    message={
                      destinationResult
                        .partialErrors.requirements
                    }
                  />
                ) : (
                  <>
                    <div className="grid gap-5 lg:grid-cols-3">
                      <RequirementList
                        title="Salida del país de origen"
                        subtitle="Requisitos de exportación"
                        items={
                          destinationResult.requisitos
                            .exportRequirements
                        }
                      />

                      <RequirementList
                        title="Entrada al país destino"
                        subtitle="Requisitos de importación"
                        items={
                          destinationResult.requisitos
                            .importRequirements
                        }
                      />

                      <RequirementList
                        title="Regulaciones no arancelarias"
                        subtitle="RNAS / NTMs"
                        items={
                          destinationResult.requisitos
                            .nonTariffMeasures
                        }
                      />
                    </div>

                    {destinationResult.requisitos
                      .references.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <h4 className="text-sm font-extrabold text-gray-800">
                          Referencias y fuentes sugeridas
                        </h4>

                        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600">
                          {destinationResult.requisitos.references.map(
                            (
                              reference,
                              index
                            ) => (
                              <li
                                key={`reference-${index}`}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-0.5 text-green-600">
                                  •
                                </span>

                                <span>
                                  {reference}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </VisualBlock>
            </div>

            {/* Compradores */}
            <div className="mt-5">
              <VisualBlock
                number="3"
                icon="🏢"
                title={`¿Quién ya compra o vende productos similares en ${destinationResult.paisDestino}?`}
                subtitle="Top 10 de empresas identificadas para el mercado seleccionado."
              >
                {destinationResult.partialErrors
                  .buyers ? (
                  <PartialError
                    message={
                      destinationResult
                        .partialErrors.buyers
                    }
                  />
                ) : destinationResult.compradores
                    .length > 0 ? (
                  <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch]">
                    <table className="min-w-[760px] divide-y divide-gray-200 md:min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <TableHeader>
                            Empresa
                          </TableHeader>

                          <TableHeader>
                            Contacto
                          </TableHeader>

                          <TableHeader>
                            Website
                          </TableHeader>

                          <TableHeader>
                            Ciudad
                          </TableHeader>

                          <TableHeader>
                            País
                          </TableHeader>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 bg-white">
                        {destinationResult.compradores.map(
                          (buyer, index) => (
                            <tr
                              key={`buyer-${
                                buyer?.company ||
                                index
                              }`}
                              className="transition hover:bg-gray-50"
                            >
                              <TableCell strong>
                                {buyer?.company ||
                                  "Sin dato"}
                              </TableCell>

                              <TableCell>
                                {buyer?.contact ||
                                  "—"}
                              </TableCell>

                              <TableCell>
                                {buyer?.website ? (
                                  <a
                                    href={normalizeWebsite(
                                      buyer.website
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all font-semibold text-green-700 underline"
                                  >
                                    {
                                      buyer.website
                                    }
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </TableCell>

                              <TableCell>
                                {buyer?.city || "—"}
                              </TableCell>

                              <TableCell>
                                {buyer?.country ||
                                  "—"}
                              </TableCell>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyResult message="No se encontraron compradores directos para este mercado." />
                )}
              </VisualBlock>
            </div>

            <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-lg text-white">
                  ✦
                </span>

                <div>
                  <div className="text-sm font-extrabold text-green-800">
                    Lectura estratégica del diagnóstico
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-green-900/90">
                    {
                      destinationResult.analisisIA
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA #1: continuidad después del resultado */}
      {destinationResult && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white shadow-xl">
            <div className="grid gap-8 p-6 md:grid-cols-[1.25fr_0.75fr] md:items-center md:p-10">
              <div>
                <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-extrabold">
                  Tu siguiente paso
                </span>

                <h3 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  Ya descubriste el potencial de tu producto.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
                  Activa tu prueba de 7 días para continuar con las
                  herramientas Premium y convertir este diagnóstico en
                  una estrategia de prospección internacional.
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-white/95">
                  <span className="rounded-full bg-white/15 px-3 py-2">
                    ✓ 7 días de prueba
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-2">
                    ✓ Cancela antes del primer cobro
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-2">
                    ✓ Acceso al Panel Premium
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-extrabold">
                  Prueba Premium durante 7 días
                </p>

                <p className="mt-2 text-xs leading-relaxed text-white/80">
                  Al finalizar el periodo de prueba, la suscripción se
                  cobrará automáticamente al método de pago registrado,
                  salvo que canceles antes.
                </p>

                <button
                  type="button"
                  onClick={openRegister}
                  className="mt-5 min-h-[50px] w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-green-700 shadow-sm transition hover:bg-green-50"
                >
                  Iniciar mi prueba de 7 días
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ¿Por qué registrarte? */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            Todo en un solo lugar
          </span>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-4xl">
            ¿Por qué registrarte en WeAreExporters?
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">
            Porque exportar no debería obligarte a consultar decenas de
            fuentes, buscar compradores manualmente y organizar toda la
            información desde cero.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            icon="🌍"
            title="Mercados"
            description="Identifica países con demanda y compara oportunidades para tu producto."
          />
          <ValueCard
            icon="📦"
            title="Requisitos"
            description="Organiza requisitos de exportación, importación y regulaciones aplicables."
          />
          <ValueCard
            icon="🏢"
            title="Compradores"
            description="Localiza empresas relacionadas con el producto y el mercado seleccionado."
          />
          <ValueCard
            icon="🤖"
            title="IA especializada"
            description="Obtén una lectura estratégica enfocada en comercio internacional."
          />
        </div>
      </section>

      {/* Beneficios Premium */}
      <section className="border-y border-gray-200 bg-gray-50/80">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-green-700">
                Acceso Premium
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                Más que una consulta: una plataforma para avanzar.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
                Durante tu prueba podrás conocer el panel y utilizar las
                funciones disponibles para transformar información en
                decisiones y acciones comerciales.
              </p>

              <button
                type="button"
                onClick={openRegister}
                className="mt-6 min-h-[50px] w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
              >
                Probar Premium por 7 días
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Consultas de mercados y productos",
                "Requisitos por país",
                "Prospección masiva",
                "Capacitación especializada",
                "Asesoría y soporte",
                "Actualizaciones comerciales",
                "Cartera digital",
                "Nuevas funciones del panel",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-black text-white">
                    ✓
                  </span>
                  <span className="text-sm font-bold leading-relaxed text-gray-800">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de progreso */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 md:p-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-green-700">
              Tu avance
            </span>
            <h2 className="mt-3 text-2xl font-black md:text-3xl">
              Ya recorriste gran parte del camino.
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-green-900/75">
              El registro es el siguiente paso para entrar al Panel
              Premium y continuar desarrollando tu oportunidad.
            </p>
          </div>

          <ProgressJourney hasResults={Boolean(destinationResult)} />

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={openRegister}
              className="min-h-[50px] w-full rounded-2xl bg-green-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
            >
              Continuar con mi prueba de 7 días
            </button>
            <p className="mt-3 text-xs text-green-900/70">
              El cobro se realiza automáticamente al finalizar la prueba,
              salvo cancelación previa.
            </p>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              ¿Tienes dudas?
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              Conoce cómo funciona la prueba, el cobro y el acceso a la
              plataforma antes de registrarte.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-3xl bg-gray-950 px-6 py-12 text-center text-white shadow-xl md:px-10">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-green-300">
            Tu producto puede llegar más lejos
          </span>

          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Tu diagnóstico fue el primer paso. Ahora conviértelo en acción.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
            Inicia tu prueba de 7 días, conoce el Panel Premium y continúa
            construyendo tu estrategia internacional con WeAreExporters.
          </p>

          <button
            type="button"
            onClick={openRegister}
            className="mt-7 min-h-[52px] w-full rounded-2xl bg-green-500 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-green-600 sm:w-auto sm:px-8"
          >
            Iniciar mi prueba de 7 días
          </button>

          <p className="mt-4 text-xs text-white/55">
            Al finalizar los 7 días se realizará el cargo automático a tu
            tarjeta. Cancela antes si decides no continuar.
          </p>
        </div>
      </section>

      {/* Footer simplificado */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-center md:text-left"
          >
            <div className="text-lg font-black tracking-tight text-gray-950">
              WeAreExporters
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Desbloquea el potencial de tu producto
            </div>
          </button>

          <div className="flex flex-col items-center gap-3 text-sm text-gray-600 sm:flex-row sm:gap-5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold transition hover:text-green-700"
            >
              {CONTACT_EMAIL}
            </a>

            {CONTACT_PHONE_LINK ? (
              <a
                href={`tel:${CONTACT_PHONE_LINK}`}
                className="font-semibold transition hover:text-green-700"
              >
                {CONTACT_PHONE_DISPLAY}
              </a>
            ) : (
              <span className="font-semibold text-gray-500">
                {CONTACT_PHONE_DISPLAY}
              </span>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:justify-end">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-extrabold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* CTA flotante para navegación móvil */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <button
          type="button"
          onClick={openRegister}
          className="flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white shadow-sm transition active:scale-[0.99]"
        >
          Iniciar prueba gratis de 7 días
        </button>
        <p className="mt-1.5 text-center text-[10px] leading-tight text-gray-500">
          Cargo automático al finalizar la prueba. Cancela antes si decides no continuar.
        </p>
      </div>
        </>
      )}

      <FreeDiagnosticLimitModal
        isOpen={showFreeLimitModal}
        onClose={closeFreeLimitModal}
        onRegister={openRegisterFromFreeLimit}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeRegister}
        onSwitchToLogin={() => {
          closeRegister();
          navigate("/");
        }}
      />
    </div>
  );
}


function ValueCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition sm:rounded-3xl sm:hover:-translate-y-1 sm:hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-black text-gray-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  );
}

function ProgressJourney({ hasResults }) {
  const steps = [
    { label: "Diagnóstico", complete: true },
    { label: "Mercados", complete: true },
    { label: "Requisitos", complete: hasResults },
    { label: "Compradores", complete: hasResults },
    { label: "Prueba Premium", complete: false, current: true },
  ];

  return (
    <div className="mt-8 grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step.label} className="relative">
          {index < steps.length - 1 && (
            <div className="absolute left-[55%] top-5 hidden h-0.5 w-[90%] bg-green-200 md:block" />
          )}

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-green-200 bg-white p-3 md:flex-col md:text-center">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                step.complete
                  ? "bg-green-600 text-white"
                  : step.current
                    ? "bg-gray-950 text-white ring-4 ring-green-200"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {step.complete ? "✓" : index + 1}
            </span>
            <span className="text-xs font-extrabold text-gray-800">
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqItem({ question, answer, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-[58px] w-full items-center justify-between gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-extrabold text-gray-900 md:text-base">
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-lg font-black text-green-700 transition ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-sm leading-relaxed text-gray-600">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

function FreeDiagnosticLimitModal({
  isOpen,
  onClose,
  onRegister,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm sm:items-center sm:px-4 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-limit-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white transition hover:bg-white/30"
        >
          ×
        </button>

        <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-6 pb-8 pt-9 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl ring-1 ring-white/30">
            ✓
          </div>

          <h2
            id="free-limit-title"
            className="mt-5 text-2xl font-black"
          >
            Has utilizado tu diagnóstico gratuito
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/90">
            Ya descubriste cómo funciona el análisis de mercados
            de WeAreExporters.
          </p>
        </div>

        <div className="p-6">
          <p className="text-center text-sm leading-relaxed text-gray-600">
            Regístrate para continuar analizando productos,
            identificar países consumidores, consultar requisitos
            y encontrar oportunidades comerciales.
          </p>

          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-extrabold text-green-900">
              Con WeAreExporters podrás:
            </p>

            <ul className="mt-3 space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="font-black">✓</span>
                Analizar más productos y mercados.
              </li>

              <li className="flex items-start gap-2">
                <span className="font-black">✓</span>
                Consultar requisitos internacionales.
              </li>

              <li className="flex items-start gap-2">
                <span className="font-black">✓</span>
                Buscar prospectos para tu producto.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onRegister}
            className="mt-6 w-full rounded-2xl bg-green-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-700"
          >
            Registrarme y continuar
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoQuestionCard({
  number,
  icon,
  title,
  desc,
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-lg">
          {icon}
        </span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-600 text-xs font-black text-white">
          {number}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-extrabold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {desc}
      </p>
    </div>
  );
}

function VisualBlock({
  number,
  icon,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:rounded-3xl">
      <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-white p-4 sm:p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-sm font-black text-white">
            {number}
          </span>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-green-100">
            {icon}
          </span>

          <div>
            <h3 className="text-base font-extrabold text-gray-900 md:text-lg">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {children}
      </div>
    </div>
  );
}

function RequirementList({
  title,
  subtitle,
  items,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <h4 className="text-sm font-extrabold text-gray-900">
        {title}
      </h4>

      <p className="mt-1 text-xs font-semibold text-green-700">
        {subtitle}
      </p>

      {Array.isArray(items) && items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex items-start gap-2 text-sm leading-relaxed text-gray-700"
            >
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-black text-white">
                ✓
              </span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          No se obtuvieron resultados para esta categoría.
        </p>
      )}
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600">
      {children}
    </th>
  );
}

function TableCell({
  children,
  strong = false,
}) {
  return (
    <td
      className={`px-4 py-3 text-sm text-gray-700 ${
        strong
          ? "font-extrabold text-gray-900"
          : ""
      }`}
    >
      {children}
    </td>
  );
}

function EmptyResult({ message }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function ErrorNotice({ message }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">
        {message}
      </p>
    </div>
  );
}

function PartialError({ message }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-800">
        Esta parte del diagnóstico no pudo completarse.
      </p>

      <p className="mt-1 text-xs leading-relaxed text-amber-700">
        {message}
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />

      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function getErrorMessage(error) {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    "Ocurrió un error durante la consulta."
  );
}

function getFriendlyErrorMessage(error) {
  const message = getErrorMessage(error);

  if (
    message.toLowerCase().includes("premium") ||
    message.includes("PREMIUM_ONLY")
  ) {
    return (
      "La IA todavía está configurada para usuarios Premium. " +
      "En el siguiente paso habilitaremos el diagnóstico público limitado sin eliminar la protección del panel Premium."
    );
  }

  if (
    message.includes("INSUFFICIENT_QUOTA") ||
    message.toLowerCase().includes("cupo")
  ) {
    return "La IA se encuentra temporalmente sin cupo. Intenta nuevamente más tarde.";
  }

  return (
    message ||
    "Ocurrió un error durante el diagnóstico."
  );
}

function normalizeWebsite(website) {
  const value = String(website || "").trim();

  if (!value) {
    return "#";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `https://${value}`;
}

function createStrategicSummary({
  producto,
  hsCode,
  paisOrigen,
  paisDestino,
  compradores,
}) {
  const buyerCount = Array.isArray(compradores)
    ? compradores.length
    : 0;

  const buyerText =
    buyerCount > 0
      ? `Se identificaron ${Math.min(
          buyerCount,
          10
        )} empresas afines en ${paisDestino}.`
      : `Será necesario profundizar la búsqueda de compradores en ${paisDestino}.`;

  return (
    `El diagnóstico comenzó identificando mercados consumidores para ${producto}, clasificado con la fracción HS ${hsCode}. ` +
    `Después de comparar las oportunidades, se seleccionó ${paisDestino} como mercado para profundizar. ` +
    `Para exportar desde ${paisOrigen}, deben validarse los requisitos de salida, los requisitos de entrada y las regulaciones no arancelarias aplicables. ` +
    `${buyerText} El siguiente paso consiste en convertir esta información en una campaña activa de prospección comercial.`
  );
}
