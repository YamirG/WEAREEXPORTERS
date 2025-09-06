// src/components/RegisterModal.jsx
import React, { useCallback, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const PAYPAL_CLIENT_ID =
  process.env.REACT_APP_PAYPAL_CLIENT_ID ||
  'AVWRzrFvVKdXb9HhxI5W1eK6uyfH8ECX6JwF4DLkadrrc2WlQm7uvvxmnbiup6ir_LbbZZkLk8wLkP3p';

const PAYPAL_PLAN_ID =
  process.env.REACT_APP_PAYPAL_PLAN_ID ||
  'P-35A37554VB605731GNC3ZBOA';

// ✅ URL del backend que verifica el token (Apps Script o Edge Function)
const RECAPTCHA_VERIFY_URL =
  process.env.REACT_APP_RECAPTCHA_VERIFY_URL || 'https://script.google.com/macros/s/AKfycbwO0yKOgj6cDwSEzNFF68XB-82_h_zEo7UZs734OA8kqdT4CFkHX1auSZUaJ4k4tIc5/exec';

async function verifyRecaptchaTokenV3(token) {
  // Si no configuraste backend todavía, no bloquees el registro:
  if (!RECAPTCHA_VERIFY_URL) return { ok: true, skipped: true };
  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token, action: 'register' }),
    });
    const data = await res.json().catch(() => ({}));
    return data; // esperado { ok: true, score, ... }
  } catch (e) {
    console.error('verifyRecaptchaTokenV3 error:', e);
    return { ok: false, error: String(e) };
  }
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    industry: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [paid, setPaid] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();

  const industries = [
    'Agricultura y alimentos',
    'Textiles y moda',
    'Tecnología',
    'Manufactura',
    'Productos químicos',
    'Farmacéutica',
    'Automotriz',
    'Muebles y decoración',
    'Otro',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      if (!agreeTerms) throw new Error('Debes aceptar los términos y privacidad.');
      if (!paid || !subscriptionId) throw new Error('Completa la suscripción con PayPal antes de crear la cuenta.');

      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está listo. Refresca la página e intenta de nuevo.');
      }

      // 1) Obtener token v3
      const token = await executeRecaptcha('register');
      if (!token) throw new Error('No se pudo obtener el token de reCAPTCHA.');

      // 2) Verificar token en tu backend (GAS/Edge)
      const check = await verifyRecaptchaTokenV3(token);
      if (!check?.ok) throw new Error('Validación reCAPTCHA fallida.');
      if (typeof check.score === 'number' && check.score < 0.5) {
        throw new Error('Detección de actividad inusual. Intenta nuevamente.');
      }

      setIsLoading(true);

      // 3) Registro en Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (signUpError) throw signUpError;

      const userId = authData?.user?.id || authData?.session?.user?.id;
      if (!userId) throw new Error('No se pudo obtener el ID del usuario.');

      const { error: insertError } = await supabase.from('users').insert([
        {
          id: userId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          industry: formData.industry,
          is_premium: false,                 // se activará por webhook de PayPal
          paypal_subscription_id: subscriptionId,
          paypal_status: 'pending',
          created_at: new Date(),
        },
      ]);
      if (insertError) throw insertError;

      alert('Cuenta creada. Tu suscripción se activará en unos segundos.');
      onClose();
      navigate('/premiumdashboard');
    } catch (err) {
      console.error('handleSubmit error:', err);
      alert(err.message || 'Error inesperado.');
    } finally {
      setIsLoading(false);
    }
  }, [agreeTerms, paid, subscriptionId, executeRecaptcha, formData, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Cerrar</span>
              <div
                className="w-6 h-6"
                dangerouslySetInnerHTML={{
                  __html:
                    `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>`,
                }}
              />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl md:text-2xl leading-6 font-bold text-gray-900 mb-6">
                  Crear una cuenta
                </h3>

                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-700">
                  <p className="mb-2">
                    Obtén <strong>7 días de Prueba Gratis</strong> al registrarte a nuestro Plan Premium.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Consultas Ilimitadas</li>
                    <li>Búsqueda Ilimitada de mercados</li>
                    <li>Listado completo de compradores</li>
                    <li>⭐ Gestión para Prospección Masiva de Compradores</li>
                    <li>Capacitación/Curso (De Cero a Exportador)</li>
                    <li>Servicio de Asesoría (Humana 1h/sem + IA 24/7)</li>
                    <li>Alertas de oportunidades comerciales</li>
                    <li>Actualizaciones Mensuales</li>
                    <li>Soporte por email</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  <input type="text" name="company" placeholder="Empresa" value={formData.company} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  <select name="industry" value={formData.industry} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md">
                    <option value="">Selecciona una industria</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>{industry}</option>
                    ))}
                  </select>

                  <div className="flex items-start">
                    <input id="terms" type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="h-4 w-4 text-green-600 border-gray-300 rounded" required />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      Acepto los <a href="#" className="text-green-600">términos</a> y <a href="#" className="text-green-600">privacidad</a>
                    </label>
                  </div>

                  {!paid ? (
                    <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, vault: true, intent: 'subscription' }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe' }}
                        createSubscription={(data, actions) => {
                          return actions.subscription.create({ plan_id: PAYPAL_PLAN_ID });
                        }}
                        onApprove={async (data) => {
                          try {
                            const subId = data?.subscriptionID;
                            if (!subId) throw new Error('No se recibió subscriptionID de PayPal.');
                            setSubscriptionId(subId);
                            setPaid(true);
                            alert('Suscripción creada correctamente. Ahora completa el formulario para registrar tu cuenta.');
                          } catch (error) {
                            console.error('Error en aprobación:', error);
                            alert('Ocurrió un error al crear la suscripción.');
                          }
                        }}
                        onError={(err) => {
                          console.error('Error de PayPal:', err);
                          alert('Error al procesar la suscripción.');
                        }}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                      disabled={isLoading || !agreeTerms}
                    >
                      {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                  )}
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="text-green-600 hover:text-green-500">
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
