import React from 'react';

/**
 * FaqSection.js
 * Sección de Preguntas Frecuentes para colocarse después de PricingSection.js
 * - Sin dependencias adicionales
 * - Accesible: usa <details>/<summary> para acordeones nativos
 * - Incluye una tabla comparativa responsive
 * - Colores adaptados a la paleta verde de WeAreExporters
 */
export default function FaqSection() {
  return (
    <section id="faq" style={styles.section} aria-labelledby="faq-heading">
      <div style={styles.container}>
        <h2 id="faq-heading" style={styles.title}>PREGUNTAS FRECUENTES</h2>

        <div style={styles.grid}>
          <div style={styles.col}>
            <details style={styles.item} open>
              <summary style={styles.summary}>❓ ¿We Are Exporters solo ofrece información o realizan gestión?</summary>
              <div style={styles.content}>
                <p>We Are Exporters es mucho más que una base de datos. Te acompañamos en todo el proceso de internacionalización de tu producto en 4 pasos clave:</p>
                <ol style={styles.listOrdered}>
                  <li>1. Ingresas los detalles de tu producto en la plataforma.</li>
                  <li>2. Identificas los países con mayor consumo y demanda.</li>
                  <li>3. Conoces los requisitos aduanales y regulatorios para exportar desde tu país e ingresar al país destino.</li>
                  <li>4. Activamos tus campañas automáticas de prospección internacional para generar compradores directos continuamente.</li>
                </ol>
                <p>Tú decides cuántos prospectos necesitas. Tú te enfocas en cerrar ventas.</p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿La plataforma me consigue compradores en el extranjero?</summary>
              <div style={styles.content}>
                <p>
                  Sí. Conseguir compradores internacionales es uno de los mayores retos para cualquier exportador.
                  Por eso, dentro del Panel Premium, puedes activar una función que genera prospectos reales y verificados en el país que tú elijas.
                  Así podrás conectarte directamente con compradores interesados —sin intermediarios ni comisiones— y enfocar tu energía en cerrar negocios.
                </p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿Cómo funciona We Are Exporters?</summary>
              <div style={styles.content}>
                <p>
                  We Are Exporters opera con IA especializado en comercio internacional bajo un modelo de suscripción mensual, similar a plataformas como Netflix o Spotify. En lugar de entretenimiento, aquí obtienes crecimiento internacional. Con tu suscripción recibes acceso a:
                </p>
                <ul style={styles.listBulleted}>
                  <li>Prospectos reales y constantes de compradores internacionales.</li>
                  <li>Rutas y guías paso a paso para tramitar los permisos, certificados y documentos necesarios para exportar desde tu país y entrar a otro.</li>
                  <li>Estudios de mercado automatizados para identificar oportunidades antes de exportar y más.</li>
                </ul>
                <p>Somos la herramienta inteligente que simplifica lo difícil, reduce tiempos de espera y acelera tus exportaciones.</p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿Esto sirve si voy empezando en exportaciones?</summary>
              <div style={styles.content}>
                <p>
                  ¡Claro que sí! We Are Exporters está diseñado tanto para principiantes como para expertos. Si nunca has exportado, la plataforma te guía paso a paso: identifica quién compra tu producto, qué necesitas, cómo tramitarlo y cómo empezar. Es como tener un departamento de exportación listo para ti, sin contratar a un equipo completo.
                </p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿Funciona para empresas que ya exportan o solo emprendedores?</summary>
              <div style={styles.content}>
                <p>
                  Funciona para ambos. Si ya exportas pero necesitas más compradores, más mercados, o quieres vender sin intermediarios, We Are Exporters es tu aliado perfecto. Nuestra tecnología te permite escalar tus ventas internacionales encontrando clientes directos en nuevos países, sin añadir costos fijos.
                </p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿Qué obtengo al suscribirme al Plan Premium?</summary>
              <div style={styles.content}>
                <ul style={styles.listBulleted}>
                  <li>🗺️ Localización de clientes finales y distribuidores para tu producto en mercados internacionales.</li>
                  <li>📄 Requisitos legales, fiscales y sanitarios para exportar según el país destino.</li>
                  <li>🔍 Validación de demanda con estudios de mercado automatizados.</li>
                  <li>🚀 Campañas de prospección masiva, con prospectos reales (incluye 1 campaña/mes con opción de más).</li>
                  <li>🤖 Chat con IA especializada en exportaciones para resolver dudas técnicas y generar estrategias.</li>
                  <li>💻 Asesorías por videollamada con expertos en comercio exterior.</li>
                  <li>🎓 Capacitación continua a través de talleres y cursos (De Cero a Exportador).</li>
                  <li>🌍 Noticias y alertas de oportunidades internacionales basadas en oferta/demanda.</li>
                </ul>
                <p>Todo lo que necesitas para exportar con resultados medibles y reales desde el primer mes.</p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿La plataforma incluye apoyo y soporte?</summary>
              <div style={styles.content}>
                <p> Sí, siempre estarás acompañado. Contamos con: </p>
                <ul style={styles.listBulleted}>
                  <li>📲 Chat especializado disponible 24/7.</li>
                  <li>🗓️ Asesorías por videollamada.</li>
                  <li>🛠️ Soporte técnico y acompañamiento en caso de dudas sobre la plataforma o el proceso de exportación.</li>
                </ul>
                <p>Desbloqueamos el potencial de tu producto.</p>
              </div>
            </details>

            <details style={styles.item}>
              <summary style={styles.summary}>❓ ¿Tiene garantía?</summary>
              <div style={styles.content}>
                <p>
                  Sí. Al registrarte activas automáticamente 7 días de prueba gratuita donde podrás explorar el panel completo, validar oportunidades reales según tu producto. Si no ves el valor, puedes cancelar sin compromiso. Si ves el potencial, podrás continuar con tu expansión global desde el día 1. También puedes solicitar una Demo para que veas en tiempo real como se aplica en tu producto.
                </p>
              </div>
            </details>
          </div>

          <div style={styles.col}>
            <div style={styles.tableWrap} role="region" aria-label="Comparativa de opciones" tabIndex={0}>
              <div style={styles.tableTitle}>Comparativa con otras opciones del mercado</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Servicio</th>
                    <th style={styles.th}>Costo Aproximado Mensual</th>
                    <th style={styles.th}>¿Incluye Prospectos Automáticos?</th>
                    <th style={styles.th}>¿Incluye Asesoría y Soporte?</th>
                    <th style={styles.th}>¿Incluye Tramitología + Requisitos?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}><strong>We Are Exporters (Plan Premium)</strong></td>
                    <td style={styles.td}>💲 Accesible desde $49 USD</td>
                    <td style={styles.td}>✅ Sí</td>
                    <td style={styles.td}>✅ Sí</td>
                    <td style={styles.td}>✅ Sí</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Consultoría especializada en exportaciones</td>
                    <td style={styles.td}>$300–$1,500 USD</td>
                    <td style={styles.td}>❌ No</td>
                    <td style={styles.td}>✅ Sí</td>
                    <td style={styles.td}>✅ Sí</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Organismos de promoción (tipo ProMéxico)</td>
                    <td style={styles.td}>Gratuito o altos costos ocultos hasta 3000usd</td>
                    <td style={styles.td}>❌ No (orientación general)</td>
                    <td style={styles.td}>❌ Limitado</td>
                    <td style={styles.td}>✅ Parcial (según programas)</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Broker/intermediarios de exportación</td>
                    <td style={styles.td}>Cobra %+fee 1500usd por operación</td>
                    <td style={styles.td}>✅ Sí (con comisión)</td>
                    <td style={styles.td}>❌ No</td>
                    <td style={styles.td}>❌ No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Paleta basada en verdes WeAreExporters
const palette = {
  bg: '#06140f',            // fondo profundo verde oscuro
  cardBg: 'rgba(10, 35, 25, 0.85)',
  border: 'rgba(34, 197, 94, 0.25)', // borde con tinte verde
  text: '#e9f6ef',          // texto principal claro
  textMuted: '#cfe9db',     // texto secundario
  accent: '#22c55e',        // verde acento (similar Tailwind emerald-500)
  accentSoft: 'rgba(34, 197, 94, 0.14)'
};

const styles = {
  section: {
    background: `linear-gradient(180deg, ${palette.bg} 0%, #082017 100%)`,
    color: palette.text,
    padding: '64px 0',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
  },
  title: {
    fontSize: 28,
    lineHeight: 1.2,
    letterSpacing: '0.02em',
    fontWeight: 800,
    margin: '0 0 28px',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 24,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    background: palette.cardBg,
    border: `1px solid ${palette.border}`,
    borderRadius: 14,
    padding: 0,
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(34,197,94,0.08), 0 10px 30px rgba(0,0,0,0.25)'
  },
  summary: {
    cursor: 'pointer',
    listStyle: 'none',
    padding: '16px 18px',
    fontWeight: 700,
    outline: 'none',
    color: palette.text,
  },
  content: {
    padding: '0 18px 16px',
    color: palette.textMuted,
  },
  listBulleted: {
    paddingLeft: 18,
    margin: '8px 0 0',
  },
  listOrdered: {
    paddingLeft: 18,
    margin: '8px 0 0',
  },
  tableWrap: {
    background: palette.cardBg,
    border: `1px solid ${palette.border}`,
    borderRadius: 14,
    padding: 16,
    overflowX: 'auto',
    boxShadow: 'inset 0 0 0 1px rgba(34,197,94,0.06)'
  },
  tableTitle: {
    fontWeight: 800,
    marginBottom: 12,
    color: palette.text,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: `1px solid ${palette.border}`,
    whiteSpace: 'nowrap',
    color: palette.text,
    background: palette.accentSoft,
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    verticalAlign: 'top',
    color: palette.textMuted,
  },
};
