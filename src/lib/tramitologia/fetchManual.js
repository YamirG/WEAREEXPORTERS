import { supabase } from '../../supabaseClient';
import { FALLBACK_MANUALS, OFFICIAL_LINKS, OFFICIAL_USER_GUIDES } from './constants';

export async function fetchManual({ country, procedure }) {
  try {
    const { data, error } = await supabase
      .from('manuals')
      .select('*')
      .eq('country', country)
      .eq('flow', 'export')
      .eq('procedure_key', procedure)
      .single();

    if (error) throw error;

    return {
      title: data?.title || '',
      steps: Array.isArray(data?.steps) ? data.steps : [],
      requirements: Array.isArray(data?.requirements) ? data.requirements : [],
      links: Array.isArray(data?.links) ? data.links : [],
      authority: data?.authority || '',
      sla: data?.sla || '',
      fees: data?.fees || '',
      updated_at: data?.updated_at || null,
      officialManual:
        data?.official_manual ||
        OFFICIAL_USER_GUIDES?.[country]?.[procedure] ||
        null,
    };
  } catch (err) {
    console.warn('fetchManual fallback local:', err?.message || err);

    const fallback = FALLBACK_MANUALS?.[country]?.[procedure];
    if (fallback) return fallback;

    return {
      title: `Guía de ${procedure} (${country})`,
      steps: [
        { title: 'Paso 1', detail: 'Revisa elegibilidad del producto.' },
        { title: 'Paso 2', detail: 'Identifica la autoridad competente y requisitos.' },
        { title: 'Paso 3', detail: 'Presenta la solicitud con tus documentos base.' },
      ],
      requirements: [
        { label: 'Documento de identidad' },
        { label: 'Factura / Proforma' },
      ],
      links: OFFICIAL_LINKS?.[country]?.[procedure] || [],
      authority: 'Autoridad competente del país',
      sla: 'Variable',
      fees: 'Sujeto a revisión',
      officialManual: OFFICIAL_USER_GUIDES?.[country]?.[procedure] || null,
    };
  }
}
