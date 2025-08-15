import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

// ✅ Ajusta con tu UUID de admin:
const ADMIN_ID = '91e330bb-4133-4246-abcc-4f470495b7f9';

const SECTIONS = [
  { key: 'pre',          label: 'Sección 1 - Pre alistamiento' },
  { key: 'alistamiento', label: 'Sección 2 - Alistamiento' },
  { key: 'exportacion',  label: 'Sección 3 - Exportación' },
];

// ------- UI helpers (coherentes con otras pestañas) -------
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-600" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const Button = ({ children, className = '', ...props }) => (
  <button
    className={
      'h-[42px] inline-flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-colors ' +
      'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ' +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Card = ({ title, subtitle, children, icon, footer }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    {(title || subtitle) && (
      <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        {icon && <div className="text-green-600 mt-0.5">{icon}</div>}
        <div>
          <div className="text-base md:text-lg font-semibold text-gray-800">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
    )}
    <div className="p-4 md:p-5">{children}</div>
    {footer && <div className="px-4 md:px-5 py-3 border-t border-gray-100">{footer}</div>}
  </div>
);

// --- Helpers para YouTube ---
function getYouTubeId(input = '') {
  const url = String(input).trim();
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{6,}$/.test(url)) return url; // ID directo
  return null;
}
const makeEmbedUrl  = (id) => `https://www.youtube.com/embed/${id}`;
const makeThumbUrl  = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

// --- Helpers para metadatos en description ---
// Estructura: "[section:<key>] [material:<url>] <texto libre>"
const buildDescription = (sectionKey, materialUrl = '', freeText = '') => {
  const parts = [`[section:${sectionKey}]`];
  const m = String(materialUrl || '').trim();
  if (m) parts.push(`[material:${m}]`);
  const tail = String(freeText || '').trim();
  return `${parts.join(' ')}${tail ? ` ${tail}` : ''}`;
};

function parseSectionFromDescription(desc = '') {
  const m = String(desc).match(/\[section:([a-z]+)\]/i);
  return m ? m[1].toLowerCase() : null;
}
function parseMaterialFromDescription(desc = '') {
  const m = String(desc).match(/\[material:([^\]]+)\]/i);
  return m ? m[1].trim() : '';
}

const CapacitacionTab = () => {
  // --------- Estado UI / sesión ----------
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form admin
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoSection, setNewVideoSection] = useState('pre');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const canAdd = newVideoTitle.trim() && newVideoUrl.trim();

  // Cursos
  const [courses, setCourses] = useState([]);

  // --------- Cargar sesión + cursos ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError('');
        // Sesión
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const uid = userData?.user?.id || null;
        setIsAdmin(uid === ADMIN_ID);

        // Cursos
        const { data, error } = await supabase
          .from('courses')
          .select('id,title,description,video_url,thumbnail_url,created_at')
          .order('created_at', { ascending: true });
        if (error) throw error;
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        setLoadError(e.message || 'No se pudieron cargar los cursos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --------- Insertar video ----------
  const handleAddVideo = useCallback(async () => {
    if (!canAdd) return;
    try {
      const ytId = getYouTubeId(newVideoUrl);
      if (!ytId) {
        throw new Error('URL/ID de YouTube inválido. Ej: https://www.youtube.com/watch?v=XXXXXXXXXXX');
      }
      const embed = makeEmbedUrl(ytId);
      const thumb = makeThumbUrl(ytId);
      const description = buildDescription(newVideoSection, newMaterialUrl, newVideoDesc);

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: newVideoTitle.trim(),
          description,
          video_url: embed,
          thumbnail_url: thumb,
        })
        .select('id,title,description,video_url,thumbnail_url,created_at')
        .single();

      if (error) throw error;

      setCourses((prev) => [...prev, data]);
      setNewVideoTitle('');
      setNewVideoUrl('');
      setNewVideoDesc('');
      setNewVideoSection('pre');
      setNewMaterialUrl('');
    } catch (e) {
      alert(`No se pudo añadir el video: ${e.message}`);
    }
  }, [canAdd, newVideoTitle, newVideoUrl, newVideoDesc, newVideoSection, newMaterialUrl]);

  // --------- Agrupar por secciones ----------
  const grouped = useMemo(() => {
    const map = { pre: [], alistamiento: [], exportacion: [] };
    for (const c of courses) {
      const section = parseSectionFromDescription(c?.description) || 'pre';
      if (section === 'alistamiento') map.alistamiento.push(c);
      else if (section === 'exportacion') map.exportacion.push(c);
      else map.pre.push(c);
    }
    return map;
  }, [courses]);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Capacitación / Curso</h2>
        <p className="text-emerald-50 mt-1">
          Biblioteca de videos y recursos para llevarte de cero a exportador.
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        {/* --- Formulario admin --- */}
        {isAdmin && (
          <Card
            title="Añadir nuevo video"
            subtitle="Sólo administradores – agrega rápidamente contenido con URL/ID de YouTube y material descargable."
            icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">🎬</span>}
            footer={
              <div className="flex justify-end">
                <Button onClick={handleAddVideo} disabled={!canAdd} title={!canAdd ? 'Completa título y URL' : 'Añadir Video'}>
                  { !canAdd ? 'Completa los campos' : 'Añadir Video' }
                </Button>
              </div>
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  placeholder="Ej. Introducción al curso"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">URL o ID de YouTube</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Sección</label>
                <select
                  value={newVideoSection}
                  onChange={(e) => setNewVideoSection(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-base"
                >
                  {SECTIONS.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={newVideoDesc}
                  onChange={(e) => setNewVideoDesc(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-base"
                  placeholder="Resumen o notas del video"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1">Material Descargable (opcional)</label>
                <input
                  type="url"
                  value={newMaterialUrl}
                  onChange={(e) => setNewMaterialUrl(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-base"
                  placeholder="Pega un enlace (Google Drive, PDF, etc.)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se guarda como metadato en la descripción y se mostrará como botón de descarga.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* --- Listado por secciones --- */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner /> Cargando cursos…
          </div>
        ) : loadError ? (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{loadError}</div>
        ) : (
          <>
            {SECTIONS.map((sec) => {
              const list = (grouped[sec.key] || []);
              return (
                <Card
                  key={sec.key}
                  title={sec.label}
                  subtitle={list.length ? `${list.length} video(s)` : 'Aún sin videos en esta sección'}
                  icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">📚</span>}
                >
                  {list.length === 0 ? (
                    <p className="text-gray-500 text-base">Sin videos en esta sección.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((video) => {
                        const vidId  = video?.id ?? `video-${video?.title}`;
                        const title  = video?.title || 'Video sin título';
                        const url    = video?.video_url || '';
                        const thumb  = video?.thumbnail_url || '';
                        const mUrl   = parseMaterialFromDescription(video?.description || '');

                        return (
                          <div key={vidId} className="bg-gray-50 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                              {url ? (
                                <iframe
                                  className="absolute top-0 left-0 w-full h-full"
                                  src={url}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={title}
                                />
                              ) : thumb ? (
                                <img
                                  alt={title}
                                  src={thumb}
                                  className="absolute top-0 left-0 w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                                  Video no disponible
                                </div>
                              )}
                            </div>
                            <div className="p-4 space-y-2">
                              <h4 className="font-semibold text-gray-800 text-base">{title}</h4>
                              {mUrl ? (
                                <a
                                  href={mUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md"
                                  title="Abrir material descargable"
                                >
                                  📎 Material descargable
                                </a>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default CapacitacionTab;
