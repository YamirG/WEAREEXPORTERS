import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

// Usa variables de entorno (recomendado)
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AVWRzrFvVKdXb9HhxI5W1eK6uyfH8ECX6JwF4DLkadrrc2WlQm7uvvxmnbiup6ir_LbbZZkLk8wLkP3p';
const PAYPAL_PLAN_ID   = process.env.REACT_APP_PAYPAL_PLAN_ID   || 'P-9JM931674E416574ENBSV54Q'; // <-- tu plan LIVE
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeQYqkrAAAAAC-ELoDg4VvVNIYiKTCZT0BDKsvT';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    industry: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Captcha
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef(null);

  // Estados de suscripción
  const [paid, setPaid] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const industries = [
    'Agricultura y alimentos', 'Textiles y moda', 'Tecnología',
    'Manufactura', 'Productos químicos', 'Farmacéutica',
    'Automotriz', 'Muebles y decoración', 'Otro'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // NOTA: Para máxima seguridad, valida el captchaToken en un backend/edge function.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Debes aceptar los términos y privacidad.');
      return;
    }
    if (!captchaToken) {
      alert('Por favor, confirma que no eres un robot (reCAPTCHA).');
      return;
    }
    if (!paid || !subscriptionId) {
      alert('Completa la suscripción con PayPal antes de crear la cuenta.');
      return;
    }

    setIsLoading(true);
    try {
      // Alta en Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (signUpError) throw signUpError;

      const userId = authData?.user?.id || authData?.session?.user?.id;
      if (!userId) throw new Error('No se pudo obtener el ID del usuario después del registro.');

      // Inserta en tabla users
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          industry: formData.industry,
          is_premium: false, // se activará por webhook cuando PayPal confirme ACTIVE
          paypal_subscription_id: subscriptionId,
          paypal_status: 'pending',
          created_at: new Date()
        }]);
      if (insertError) throw insertError;

      alert('Cuenta creada. Tu suscripción se activará en unos segundos.');
      onClose();
      navigate('/premiumdashboard');
    } catch (error) {
      console.error('Error en el registro:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
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
                    `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>`
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

                {/* Texto agregado (beneficios del plan) */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-700">
                  <p className="mb-2">
                    Desbloquea el potencial de tu producto. Al registrarte te estás suscribiendo a nuestro <strong>Plan Premium</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Consultas Ilimitadas</li>
                    <li>Búsqueda Ilimitada de mercados</li>
                    <li>Listado completo de compradores</li>
                    <li>⭐ Gestión para Prospección Masiva de Compradores</li>
                    <li>Capacitación/Curso (De Cero a Exportador)</li>
                    <li>Servicio de Asesoría (Humana: 1 hora/semana + IA 24/7)</li>
                    <li>Alerta de oportunidades comerciales</li>
                    <li>Actualizaciones Mensuales</li>
                    <li>Soporte por email</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    name="company"
                    placeholder="Empresa"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecciona una industria</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>{industry}</option>
                    ))}
                  </select>

                  {/* Terms */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      Acepto los <a href="#" className="text-green-600">términos</a> y <a href="#" className="text-green-600">privacidad</a>
                    </label>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verificación de seguridad</label>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={(token) => setCaptchaToken(token || '')}
                      onExpired={() => setCaptchaToken('')}
                    />
                    {!captchaToken && (
                      <p className="text-xs text-gray-500 mt-2">
                        Resuelve el reCAPTCHA para habilitar el pago con PayPal.
                      </p>
                    )}
                  </div>

                  {/* PayPal Subscriptions */}
                  {!paid ? (
                    captchaToken ? (
                      <PayPalScriptProvider
                        options={{
                          'client-id': PAYPAL_CLIENT_ID,
                          vault: true,
                          intent: 'subscription',
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe' }}
                          createSubscription={(data, actions) => {
                            // Seguridad adicional: bloquear si el captcha se perdió/expiró
                            if (!captchaToken) {
                              alert('Confirma que no eres un robot (reCAPTCHA).');
                              // Lanzar error para cancelar el flujo de PayPal
                              return Promise.reject(new Error('MISSING_RECAPTCHA'));
                            }
                            return actions.subscription.create({
                              plan_id: PAYPAL_PLAN_ID,
                            });
                          }}
                          onApprove={async (data, actions) => {
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
                      <div className="border rounded-md p-3 bg-gray-50 text-sm text-gray-600">
                        Completa el reCAPTCHA para habilitar el botón de suscripción de PayPal.
                      </div>
                    )
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
