import React, { useCallback, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';

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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Soporte por Email</h2>
        <p className="text-emerald-50 mt-1">
          ¿Necesitas ayuda? Envíanos tu caso y te responderemos por correo.
        </p>
      </div>

      {/* Body */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100">
            <div className="text-base md:text-lg font-semibold text-gray-800">
              Crear ticket de soporte
            </div>
            <div className="text-sm text-gray-500">Describe el problema con el mayor detalle posible.</div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4">
            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Tu email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="usuario@dominio.com"
                className="px-3 py-2 border border-gray-300 rounded-lg text-base"
                required
              />
            </div>

            {/* Asunto */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Asunto</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-base"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Descripción del problema</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos qué sucede, pasos para reproducirlo, capturas (si aplica), navegador, etc."
                className="px-3 py-2 border border-gray-300 rounded-lg text-base"
                required
              />
            </div>

            {/* Alertas */}
            {alert.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  alert.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {alert.text}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={disabled}
                className="h-[42px] px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Enviando…' : 'Enviar a Soporte'}
              </button>
              <div className="text-xs text-gray-500">
                Te llegará un correo de confirmación a <b>{userEmail || 'tu email'}</b>.
              </div>
            </div>
          </form>
        </div>

        {/* Contacto directo (fallback) */}
        <div className="mt-6 text-sm text-gray-500">
          ¿Prefieres escribirnos directo? Envíanos un correo a{' '}
          <a className="text-emerald-700 underline" href="mailto:somosexportadoresmx@gmail.com">
            somosexportadoresmx@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default SoporteTab;
