import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Button, Card, Badge, Input, Select, Alert, Loader, EmptyState } from '../ui';

// ✅ Ajusta con tu UUID de admin:
const ADMIN_ID = '91e330bb-4133-4246-abcc-4f470495b7f9';

const SECTIONS = [
  { key: 'pre',          label: 'Sección 1 - Pre alistamiento' },
  { key: 'alistamiento', label: 'Sección 2 - Alistamiento' },
  { key: 'exportacion',  label: 'Sección 3 - Exportación' },
];

// ------- UI helpers conservados ----------
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-700" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
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

const SectionIcon = ({ index }) => {
  const icons = ['🌱', '📦', '🚢'];
  return (
    <div className="h-12 w-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl">
      {icons[index] || '📚'}
    </div>
  );
};

const VideoCard = ({ video }) => {
  const vidId  = video?.id ?? `video-${video?.title}`;
  const title  = video?.title || 'Video sin título';
  const url    = video?.video_url || '';
  const thumb  = video?.thumbnail_url || '';
  const mUrl   = parseMaterialFromDescription(video?.description || '');

  return (
    <div
      key={vidId}
      className="group bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative bg-gray-100" style={{ paddingBottom: '56.25%', height: 0 }}>
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

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="success">Video</Badge>
          {mUrl ? <Badge variant="neutral">Material</Badge> : null}
        </div>

        <h4 className="font-extrabold text-gray-900 text-base leading-snug">
          {title}
        </h4>

        {mUrl ? (
          <a
            href={mUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-200 transition"
            title="Abrir material descargable"
          >
            📎 Material descargable
          </a>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Sin material adicional por ahora.
          </p>
        )}
      </div>
    </div>
  );
};

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

  const totalMaterials = useMemo(() => {
    return courses.filter((course) => parseMaterialFromDescription(course?.description || '')).length;
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Capacitación</Badge>
                <span className="text-sm text-gray-500">
                  Biblioteca de aprendizaje exportador
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Aprende a exportar paso a paso
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Biblioteca de videos y recursos para llevarte de cero a exportador.
                Avanza por módulos: pre alistamiento, alistamiento y exportación.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Videos disponibles</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-1">
              {courses.length}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Contenido activo en la biblioteca.
            </p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Materiales</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
              {totalMaterials}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Recursos descargables vinculados.
            </p>
          </Card>
        </div>
      </section>

      {/* Admin form */}
      {isAdmin && (
        <Card className="overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="premium">Admin</Badge>
                  <span className="text-xs text-gray-400">Gestión de contenido</span>
                </div>

                <h3 className="text-2xl font-extrabold text-gray-900">
                  Añadir nuevo video
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Agrega rápidamente contenido con URL/ID de YouTube y material descargable.
                </p>
              </div>

              <Button
                onClick={handleAddVideo}
                disabled={!canAdd}
                title={!canAdd ? 'Completa título y URL' : 'Añadir Video'}
                className="w-full md:w-auto"
              >
                {!canAdd ? 'Completa los campos' : 'Añadir Video'}
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Título"
                type="text"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                placeholder="Ej. Introducción al curso"
              />

              <Input
                label="URL o ID de YouTube"
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
              />

              <Select
                label="Sección"
                value={newVideoSection}
                onChange={(e) => setNewVideoSection(e.target.value)}
              >
                {SECTIONS.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </Select>

              <Input
                label="Descripción (opcional)"
                type="text"
                value={newVideoDesc}
                onChange={(e) => setNewVideoDesc(e.target.value)}
                placeholder="Resumen o notas del video"
              />

              <div className="md:col-span-2">
                <Input
                  label="Material descargable (opcional)"
                  type="url"
                  value={newMaterialUrl}
                  onChange={(e) => setNewMaterialUrl(e.target.value)}
                  placeholder="Pega un enlace (Google Drive, PDF, etc.)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Se guarda como metadato en la descripción y se mostrará como botón de descarga.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      {loading ? (
        <Card className="p-6">
          <Loader text="Cargando cursos…" />
        </Card>
      ) : loadError ? (
        <Alert variant="danger">{loadError}</Alert>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((sec, index) => {
            const list = grouped[sec.key] || [];

            return (
              <Card key={sec.key} className="overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <SectionIcon index={index} />

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="success">Módulo {index + 1}</Badge>
                          <span className="text-xs text-gray-400">
                            {list.length ? `${list.length} video(s)` : 'Aún sin videos'}
                          </span>
                        </div>

                        <h3 className="text-2xl font-extrabold text-gray-900">
                          {sec.label}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {index === 0 && 'Fundamentos para preparar tu empresa y producto antes de exportar.'}
                          {index === 1 && 'Preparación operativa, documental y comercial para iniciar el proceso.'}
                          {index === 2 && 'Ejecución del envío, trámites y seguimiento de operación internacional.'}
                        </p>
                      </div>
                    </div>

                    <Badge variant="neutral">{list.length} contenidos</Badge>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  {list.length === 0 ? (
                    <EmptyState
                      title="Sin videos en esta sección"
                      description="Esta sección aún no tiene contenido cargado. Pronto podrás encontrar recursos aquí."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {list.map((video) => (
                        <VideoCard key={video?.id ?? `video-${video?.title}`} video={video} />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CapacitacionTab;
