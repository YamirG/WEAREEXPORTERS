import React, { useCallback, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Button, Card, Badge, Input, Select, Alert } from '../ui';

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbyKpvzlMDGA5uLlWP748cRW7nPsQoMiGrbcLxFafKgHUd5liuvUovEbxGx0tEfsQXFP/exec';

const SUBJECTS = [
  'CONSULTAS',
  'PROSPECCION MASIVA',
  'CARTERA DIGITAL',
  'CAPACITACION',
  'ACTUALIZACIONES',
  'OTROS',
];

const SoporteTab = () => {
  const [userEmail, setUserEmail] = useState('');
  const [subject, setSubject] = useState('CONSULTAS');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  // Intenta precargar email del usuario logueado
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email || '';
        if (email) setUserEmail(email);
      } catch {/* noop */}
    })();
  }, []);

  const disabled = useMemo(
    () => sending || !userEmail.trim() || !message.trim(),
    [sending, userEmail, message]
  );

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    setAlert({ type: '', text: '' });

    const email = userEmail.trim();
    const asunto = subject.trim();
    const descripcion = message.trim();

    if (!email || !descripcion) {
      setAlert({ type: 'error', text: 'Ingresa tu email y describe el problema.' });
      return;
    }

    try {
      setSending(true);

      // ✅ Envío como x-www-form-urlencoded (ideal para Apps Script)
      const form = new URLSearchParams();
      form.append('tipo', 'soporte');
      form.append('email', email);
      form.append('asunto', asunto);
      form.append('descripcion', descripcion);

      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          // OJO: Este header es "simple" y NO dispara preflight en la mayoría de casos
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: form.toString(),
      });

      // Apps Script siempre responde 200; validamos JSON
      const text = await res.text();
      let json = {};
      try { json = JSON.parse(text); } catch { /* si no es JSON, lo tratamos como error genérico */ }

      if (json?.ok) {
        setAlert({ type: 'ok', text: 'Mensaje enviado. Nuestro equipo te contactará por correo.' });
        setMessage('');
      } else {
        setAlert({
          type: 'error',
          text: json?.error || 'No se pudo enviar el mensaje. Intenta nuevamente.',
        });
      }
    } catch (err) {
      setAlert({ type: 'error', text: err?.message || 'Error de red' });
    } finally {
      setSending(false);
    }
  }, [userEmail, subject, message]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Soporte Premium</Badge>
                <span className="text-sm text-gray-500">
                  Atención por correo y seguimiento
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Centro de soporte
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                ¿Necesitas ayuda en el uso de la plataforma? Envíanos tu caso con el mayor detalle posible y nuestro equipo
                dará seguimiento por correo. Puedes reportar dudas de consultas, prospección,
                cartera digital, capacitación, actualizaciones u otros temas.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Canal principal</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-1">
              Email
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Respuesta y seguimiento por correo.
            </p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Recomendación</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              Describe el caso completo
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Incluye pasos, capturas, navegador y correo de contacto.
            </p>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Formulario */}
        <div className="xl:col-span-8">
          <Card className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="success">Ticket de soporte</Badge>
                    <span className="text-xs text-gray-400">
                      Enviado vía Apps Script
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900">
                    Crear ticket
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Describe el problema con el mayor detalle posible para ayudarte más rápido.
                  </p>
                </div>

                <Badge variant={sending ? 'warning' : 'neutral'}>
                  {sending ? 'Enviando' : 'Disponible'}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tu email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="usuario@dominio.com"
                  required
                />

                <Select
                  label="Asunto"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción del problema
                </label>
                <textarea
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos qué sucede, pasos para reproducirlo, capturas si aplica, navegador, sección afectada, etc."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
                  required
                />
              </div>

              {alert.text && (
                <Alert variant={alert.type === 'ok' ? 'success' : 'danger'}>
                  {alert.text}
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <div className="text-xs text-gray-500">
                  Te llegará un correo de confirmación a{' '}
                  <b>{userEmail || 'tu email'}</b>.
                </div>

                <Button
                  type="submit"
                  disabled={disabled}
                  className="w-full sm:w-auto"
                >
                  {sending ? 'Enviando…' : 'Enviar a Soporte'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Lateral */}
        <aside className="xl:col-span-4 space-y-5">
          <Card className="p-5">
            <h3 className="text-lg font-extrabold text-gray-900">
              Antes de enviar
            </h3>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Describe el flujo</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Indica qué estabas intentando hacer y en qué pestaña ocurrió.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Agrega detalles</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Incluye navegador, fecha, mensaje de error o captura si aplica.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Revisa tu correo</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    El seguimiento se realizará al email indicado en el ticket.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <Badge variant="success">Contacto directo</Badge>

            <h3 className="text-lg font-extrabold text-gray-900 mt-3">
              ¿Prefieres escribirnos?
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              También puedes enviar tu caso directamente por correo.
            </p>

            <a
              className="inline-flex mt-4 text-sm font-semibold text-green-700 underline break-all"
              href="mailto:somosexportadoresmx@gmail.com"
            >
              somosexportadoresmx@gmail.com
            </a>
          </Card>
        </aside>
      </section>
    </div>
  );
};

export default SoporteTab;
