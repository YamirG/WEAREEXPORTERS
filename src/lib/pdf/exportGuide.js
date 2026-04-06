import dayjs from 'dayjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Compatibilidad con distintas versiones de pdfmake
pdfMake.vfs =
  pdfFonts?.pdfMake?.vfs ||
  pdfFonts?.vfs ||
  pdfFonts;

export const exportGuide = (manual) => {
  if (!manual) return;

  const {
    title,
    country,
    procedureKey,
    procedureLabel,
    hsCode,
    steps = [],
    requirements = [],
    links = [],
    authority,
    sla,
    fees,
    generatedAt,
  } = manual;

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        text: 'WeAreExporters · Tramitología — Exportar',
        fontSize: 16,
        bold: true,
        color: '#045023',
        margin: [0, 0, 0, 10],
      },
      {
        text: title || 'Manual de Exportación',
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 8],
      },
      {
        text:
          `País: ${country || '—'}\n` +
          `Trámite: ${procedureLabel || procedureKey || '—'}` +
          (hsCode ? `\nHS Code / Producto: ${hsCode}` : ''),
        margin: [0, 0, 0, 12],
      },
      {
        text: 'Requisitos',
        fontSize: 12,
        bold: true,
        color: '#045023',
        margin: [0, 8, 0, 6],
      },
      {
        ul: requirements.length
          ? requirements.map((r) => r.label || 'Requisito')
          : ['No disponibles'],
      },
      {
        text: 'Pasos',
        fontSize: 12,
        bold: true,
        color: '#045023',
        margin: [0, 12, 0, 6],
      },
      {
        ol: steps.length
          ? steps.map((s) => `${s.title || 'Paso'}: ${s.detail || ''}`)
          : ['Sin pasos disponibles'],
      },
      {
        text: 'Enlaces oficiales',
        fontSize: 12,
        bold: true,
        color: '#045023',
        margin: [0, 12, 0, 6],
      },
      ...(links.length
        ? links.map((l) => ({
            text: l.label || l.url || 'Enlace',
            link: l.url,
            color: 'blue',
            decoration: 'underline',
            margin: [0, 0, 0, 4],
          }))
        : [{ text: 'Sin enlaces oficiales disponibles' }]),
      {
        text: 'Resumen adicional',
        fontSize: 12,
        bold: true,
        color: '#045023',
        margin: [0, 12, 0, 6],
      },
      {
        text:
          `Autoridad: ${authority || '—'}\n` +
          `Tiempos: ${sla || '—'}\n` +
          `Costos: ${fees || '—'}\n` +
          `Fecha de generación: ${
            generatedAt
              ? dayjs(generatedAt).format('DD/MM/YYYY HH:mm')
              : dayjs().format('DD/MM/YYYY HH:mm')
          }`,
      },
    ],
    footer: function () {
      return {
        margin: [40, 10, 40, 0],
        text: 'WeAreExporters (www.weareexporters.com) — Desbloquea el potencial de tu producto',
        alignment: 'center',
        color: '#045023',
        fontSize: 9,
      };
    },
  };

  pdfMake.createPdf(docDefinition).download(
    `Manual_Exportar_${country || 'XX'}_${procedureKey || 'tramite'}.pdf`
  );
};