import dayjs from 'dayjs';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
    officialManual,
  } = manual;

  const officialManualBlock = officialManual
    ? [
        {
          text: 'Guía oficial de usuario',
          fontSize: 12,
          bold: true,
          color: '#045023',
          margin: [0, 12, 0, 6],
        },
        {
          text: `Manual: ${officialManual.label || 'Manual oficial'}`,
          margin: [0, 0, 0, 4],
        },
        {
          text: `Dependencia: ${officialManual.agency || '—'}`,
          margin: [0, 0, 0, 4],
        },
        ...(officialManual.notes
          ? [{ text: `Notas: ${officialManual.notes}`, margin: [0, 0, 0, 4] }]
          : []),
        ...(officialManual.url
          ? [{
              text: officialManual.url,
              link: officialManual.url,
              color: 'blue',
              decoration: 'underline',
              margin: [0, 0, 0, 4],
            }]
          : []),
        ...(officialManual.lastChecked
          ? [{ text: `Última revisión del enlace: ${officialManual.lastChecked}`, margin: [0, 0, 0, 4] }]
          : []),
      ]
    : [];

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

      ...officialManualBlock,

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
          }\n` +
          `Nota: Verifica siempre la versión vigente del manual en la fuente oficial.`,
      },
    ],
    footer: function () {
      return {
        margin: [40, 10, 40, 0],
        text: 'WeAreExporters — Desbloquea el potencial de tu producto',
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
