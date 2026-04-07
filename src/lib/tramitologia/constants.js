// src/lib/tramitologia/constants.js
export const BRAND = {
  primary: '#045023',
  name: 'WeAreExporters',
};

export const COUNTRIES = [
  { code: 'MX', label: 'México' },
  { code: 'CO', label: 'Colombia' },
  { code: 'PE', label: 'Perú' },
  { code: 'CL', label: 'Chile' },
];

export const EXPORT_PROCEDURES = [
  { key: 'certificado_origen', label: 'Certificado de Origen' },
  { key: 'certificado_fitosanitario', label: 'Certificado Fitosanitario' },
  { key: 'registro_sanitario', label: 'Registro Sanitario' },
  { key: 'permisos_padrones', label: 'Permisos/Padrones Sectoriales' },
];

// Enlaces oficiales por país/procedimiento
export const OFFICIAL_LINKS = {
  MX: {
    certificado_origen: [{ label: 'VUCEM', url: 'https://www.ventanillaunica.gob.mx/' }],
    certificado_fitosanitario: [{ label: 'SENASICA', url: 'https://www.gob.mx/senasica' }],
    registro_sanitario: [{ label: 'COFEPRIS', url: 'https://www.gob.mx/cofepris' }],
    permisos_padrones: [{ label: 'SAT Padrón Exportadores', url: 'https://www.sat.gob.mx/' }],
  },
  CO: {
    certificado_origen: [{ label: 'MinCIT', url: 'https://www.mincit.gov.co/' }],
    certificado_fitosanitario: [{ label: 'ICA', url: 'https://www.ica.gov.co/' }],
    registro_sanitario: [{ label: 'INVIMA', url: 'https://www.invima.gov.co/' }],
    permisos_padrones: [{ label: 'DIAN', url: 'https://www.dian.gov.co/' }],
  },
  PE: {
    certificado_origen: [{ label: 'MINCETUR', url: 'https://www.gob.pe/mincetur' }],
    certificado_fitosanitario: [{ label: 'SENASA Perú', url: 'https://www.gob.pe/senasa' }],
    registro_sanitario: [{ label: 'DIGEMID', url: 'https://www.digemid.minsa.gob.pe/' }],
    permisos_padrones: [{ label: 'SUNAT', url: 'https://www.sunat.gob.pe/' }],
  },
  CL: {
    certificado_origen: [{ label: 'ProChile', url: 'https://www.prochile.gob.cl/' }],
    certificado_fitosanitario: [{ label: 'SAG', url: 'https://www.sag.gob.cl/' }],
    registro_sanitario: [{ label: 'ISP', url: 'https://www.ispch.cl/' }],
    permisos_padrones: [{ label: 'SII', url: 'https://www.sii.cl/' }],
  },
};

// NUEVO: guías oficiales de usuario por trámite
export const OFFICIAL_USER_GUIDES = {
  MX: {
    certificado_origen: {
      label: 'Guía oficial de usuario - Certificado de Origen',
      agency: 'VUCEM / Secretaría de Economía',
      url: 'https://www.ventanillaunica.gob.mx/vucem/Tramites/SE.html',
      type: 'web',
      notes: 'Consulta el manual o guía operativa vigente del trámite dentro del portal oficial.',
      lastChecked: '2026-04-06',
    },
    certificado_fitosanitario: {
      label: 'Guía oficial de usuario - Certificado Fitosanitario',
      agency: 'SENASICA',
      url: 'https://www.gob.mx/senasica',
      type: 'web',
      notes: 'Verifica guías y requisitos operativos vigentes para emisión del certificado fitosanitario.',
      lastChecked: '2026-04-06',
    },
    registro_sanitario: {
      label: 'Manual oficial de trámites electrónicos',
      agency: 'COFEPRIS',
      url: 'https://www.gob.mx/cofepris/documentos/manuales-tramites-electronicos',
      type: 'web',
      notes: 'Revisa el manual vigente aplicable al trámite sanitario correspondiente.',
      lastChecked: '2026-04-06',
    },
    permisos_padrones: {
      label: 'Guía oficial - Padrón de Exportadores Sectorial',
      agency: 'SAT',
      url: 'https://omawww.sat.gob.mx/PadronImportadoresExportadores/Paginas/default.htm',
      type: 'web',
      notes: 'Consulta las guías vigentes del SAT para inscripción, actualización o cumplimiento.',
      lastChecked: '2026-04-06',
    },
  },

  CO: {
    certificado_origen: {
      label: 'Guía oficial de usuario - Certificado de Origen',
      agency: 'MinCIT',
      url: 'https://www.mincit.gov.co/',
      type: 'web',
      notes: 'Verifica la guía oficial vigente publicada por la autoridad competente.',
      lastChecked: '2026-04-06',
    },
    certificado_fitosanitario: {
      label: 'Guía oficial de usuario - Certificado Fitosanitario',
      agency: 'ICA',
      url: 'https://www.ica.gov.co/',
      type: 'web',
      notes: 'Consulta el instructivo operativo disponible en el portal oficial.',
      lastChecked: '2026-04-06',
    },
    registro_sanitario: {
      label: 'Guía oficial de usuario - Registro Sanitario',
      agency: 'INVIMA',
      url: 'https://www.invima.gov.co/',
      type: 'web',
      notes: 'Valida el procedimiento y manual aplicable al trámite.',
      lastChecked: '2026-04-06',
    },
    permisos_padrones: {
      label: 'Guía oficial de usuario - Permisos / Padrones',
      agency: 'DIAN',
      url: 'https://www.dian.gov.co/',
      type: 'web',
      notes: 'Revisa los instructivos publicados por la autoridad tributaria/aduanera.',
      lastChecked: '2026-04-06',
    },
  },

  PE: {
    certificado_origen: {
      label: 'Guía oficial de usuario - Certificado de Origen',
      agency: 'MINCETUR',
      url: 'https://www.gob.pe/mincetur',
      type: 'web',
      notes: 'Consulta la guía o manual oficial vigente.',
      lastChecked: '2026-04-06',
    },
    certificado_fitosanitario: {
      label: 'Guía oficial de usuario - Certificado Fitosanitario',
      agency: 'SENASA Perú',
      url: 'https://www.gob.pe/senasa',
      type: 'web',
      notes: 'Verifica el instructivo oficial actualizado.',
      lastChecked: '2026-04-06',
    },
    registro_sanitario: {
      label: 'Guía oficial de usuario - Registro Sanitario',
      agency: 'DIGEMID',
      url: 'https://www.digemid.minsa.gob.pe/',
      type: 'web',
      notes: 'Confirma los lineamientos operativos y la guía vigente.',
      lastChecked: '2026-04-06',
    },
    permisos_padrones: {
      label: 'Guía oficial de usuario - Permisos / Padrones',
      agency: 'SUNAT',
      url: 'https://www.sunat.gob.pe/',
      type: 'web',
      notes: 'Consulta instructivos y guías del portal oficial.',
      lastChecked: '2026-04-06',
    },
  },

  CL: {
    certificado_origen: {
      label: 'Guía oficial de usuario - Certificado de Origen',
      agency: 'ProChile',
      url: 'https://www.prochile.gob.cl/',
      type: 'web',
      notes: 'Consulta el material operativo vigente.',
      lastChecked: '2026-04-06',
    },
    certificado_fitosanitario: {
      label: 'Guía oficial de usuario - Certificado Fitosanitario',
      agency: 'SAG',
      url: 'https://www.sag.gob.cl/',
      type: 'web',
      notes: 'Verifica manuales o instructivos vigentes del trámite.',
      lastChecked: '2026-04-06',
    },
    registro_sanitario: {
      label: 'Guía oficial de usuario - Registro Sanitario',
      agency: 'ISP',
      url: 'https://www.ispch.cl/',
      type: 'web',
      notes: 'Revisa la guía actual del trámite sanitario que aplique.',
      lastChecked: '2026-04-06',
    },
    permisos_padrones: {
      label: 'Guía oficial de usuario - Permisos / Padrones',
      agency: 'SII',
      url: 'https://www.sii.cl/',
      type: 'web',
      notes: 'Consulta instrucciones y documentación oficial vigente.',
      lastChecked: '2026-04-06',
    },
  },
};

// Plantilla base para fallback
const baseProcedureFallback = (countryName, title, links = [], officialManual = null) => ({
  title,
  steps: [
    {
      title: 'Revisión del trámite',
      detail: 'Verifica si tu producto requiere este trámite para exportar al país destino.',
    },
    {
      title: 'Preparación de documentos',
      detail: 'Reúne la documentación base del exportador, producto y embarque.',
    },
    {
      title: 'Presentación de solicitud',
      detail: 'Ingresa la solicitud ante la autoridad o ventanilla oficial correspondiente.',
    },
    {
      title: 'Seguimiento y emisión',
      detail: 'Da seguimiento al trámite hasta obtener la aprobación o certificado correspondiente.',
    },
  ],
  requirements: [
    { label: 'Identificación o datos del exportador' },
    { label: 'Factura comercial o proforma' },
    { label: 'Datos del producto y del embarque' },
  ],
  links,
  authority: `Autoridad competente de ${countryName}`,
  sla: 'Variable según trámite y autoridad',
  fees: 'Sujeto a revisión oficial',
  officialManual,
});

// Fallbacks locales
export const FALLBACK_MANUALS = {
  MX: {
    certificado_origen: {
      title: 'Certificado de Origen (MX)',
      steps: [
        { title: 'Ingresar a VUCEM', detail: 'Accede a ventanillaunica.gob.mx con tu e.firma.' },
        { title: 'Captura de solicitud', detail: 'Selecciona el trámite y completa campos obligatorios.' },
        { title: 'Adjuntar documentos', detail: 'Factura, transporte y/o identificación.' },
        { title: 'Firmar y enviar', detail: 'Firma con e.firma y envía.' },
        { title: 'Descargar certificado', detail: 'Recibe confirmación y descarga el documento.' },
      ],
      requirements: [
        { label: 'Factura comercial' },
        { label: 'Documento de transporte (BL/Guía/Carta Porte)' },
        { label: 'Identificación del exportador' },
      ],
      links: OFFICIAL_LINKS.MX.certificado_origen,
      authority: 'Secretaría de Economía / VUCEM',
      sla: '24–48 h hábiles',
      fees: 'Sin costo ante SE (puede haber costos notariales)',
      officialManual: OFFICIAL_USER_GUIDES.MX.certificado_origen,
    },

    certificado_fitosanitario: {
      title: 'Certificado Fitosanitario de Exportación (MX)',
      steps: [
        { title: 'Registro en SENASICA', detail: 'Verifica habilitaciones para el producto/país destino.' },
        { title: 'Inspección/Tratamientos', detail: 'Cumple protocolos fitosanitarios establecidos.' },
        { title: 'Solicitud del certificado', detail: 'A través de la ventanilla correspondiente.' },
        { title: 'Emisión', detail: 'Recibe el certificado para adjuntar al embarque.' },
      ],
      requirements: [
        { label: 'Solicitud digital' },
        { label: 'Evidencia de inspección/tratamientos' },
        { label: 'Datos del embarque' },
      ],
      links: OFFICIAL_LINKS.MX.certificado_fitosanitario,
      authority: 'SENASICA',
      sla: 'Variable según producto',
      fees: 'Tarifas según servicio',
      officialManual: OFFICIAL_USER_GUIDES.MX.certificado_fitosanitario,
    },

    registro_sanitario: baseProcedureFallback(
      'México',
      'Registro Sanitario de Exportación (MX)',
      OFFICIAL_LINKS.MX.registro_sanitario,
      OFFICIAL_USER_GUIDES.MX.registro_sanitario
    ),

    permisos_padrones: baseProcedureFallback(
      'México',
      'Permisos / Padrones Sectoriales de Exportación (MX)',
      OFFICIAL_LINKS.MX.permisos_padrones,
      OFFICIAL_USER_GUIDES.MX.permisos_padrones
    ),
  },

  CO: {
    certificado_origen: baseProcedureFallback(
      'Colombia',
      'Certificado de Origen (CO)',
      OFFICIAL_LINKS.CO.certificado_origen,
      OFFICIAL_USER_GUIDES.CO.certificado_origen
    ),
    certificado_fitosanitario: baseProcedureFallback(
      'Colombia',
      'Certificado Fitosanitario de Exportación (CO)',
      OFFICIAL_LINKS.CO.certificado_fitosanitario,
      OFFICIAL_USER_GUIDES.CO.certificado_fitosanitario
    ),
    registro_sanitario: baseProcedureFallback(
      'Colombia',
      'Registro Sanitario de Exportación (CO)',
      OFFICIAL_LINKS.CO.registro_sanitario,
      OFFICIAL_USER_GUIDES.CO.registro_sanitario
    ),
    permisos_padrones: baseProcedureFallback(
      'Colombia',
      'Permisos / Padrones Sectoriales de Exportación (CO)',
      OFFICIAL_LINKS.CO.permisos_padrones,
      OFFICIAL_USER_GUIDES.CO.permisos_padrones
    ),
  },

  PE: {
    certificado_origen: baseProcedureFallback(
      'Perú',
      'Certificado de Origen (PE)',
      OFFICIAL_LINKS.PE.certificado_origen,
      OFFICIAL_USER_GUIDES.PE.certificado_origen
    ),
    certificado_fitosanitario: baseProcedureFallback(
      'Perú',
      'Certificado Fitosanitario de Exportación (PE)',
      OFFICIAL_LINKS.PE.certificado_fitosanitario,
      OFFICIAL_USER_GUIDES.PE.certificado_fitosanitario
    ),
    registro_sanitario: baseProcedureFallback(
      'Perú',
      'Registro Sanitario de Exportación (PE)',
      OFFICIAL_LINKS.PE.registro_sanitario,
      OFFICIAL_USER_GUIDES.PE.registro_sanitario
    ),
    permisos_padrones: baseProcedureFallback(
      'Perú',
      'Permisos / Padrones Sectoriales de Exportación (PE)',
      OFFICIAL_LINKS.PE.permisos_padrones,
      OFFICIAL_USER_GUIDES.PE.permisos_padrones
    ),
  },

  CL: {
    certificado_origen: baseProcedureFallback(
      'Chile',
      'Certificado de Origen (CL)',
      OFFICIAL_LINKS.CL.certificado_origen,
      OFFICIAL_USER_GUIDES.CL.certificado_origen
    ),
    certificado_fitosanitario: baseProcedureFallback(
      'Chile',
      'Certificado Fitosanitario de Exportación (CL)',
      OFFICIAL_LINKS.CL.certificado_fitosanitario,
      OFFICIAL_USER_GUIDES.CL.certificado_fitosanitario
    ),
    registro_sanitario: baseProcedureFallback(
      'Chile',
      'Registro Sanitario de Exportación (CL)',
      OFFICIAL_LINKS.CL.registro_sanitario,
      OFFICIAL_USER_GUIDES.CL.registro_sanitario
    ),
    permisos_padrones: baseProcedureFallback(
      'Chile',
      'Permisos / Padrones Sectoriales de Exportación (CL)',
      OFFICIAL_LINKS.CL.permisos_padrones,
      OFFICIAL_USER_GUIDES.CL.permisos_padrones
    ),
  },
};
