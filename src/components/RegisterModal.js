import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';

// Usa variables de entorno (recomendado)
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AVWRzrFvVKdXb9HhxI5W1eK6uyfH8ECX6JwF4DLkadrrc2WlQm7uvvxmnbiup6ir_LbbZZkLk8wLkP3p';
const PAYPAL_PLAN_ID   = process.env.REACT_APP_PAYPAL_PLAN_ID   || 'P-9JM931674E416574ENBSV54Q'; // <-- tu plan LIVE

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    industry: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Estados de suscripción
  const [paid, setPaid] = useState(false);               // true cuando se crea/aprueba la suscripción
  const [subscriptionId, setSubscriptionId] = useState(''); // lo devuelve PayPal en onApprove
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

  // 1) Primero el usuario APRUEBA la SUSCRIPCIÓN en PayPal -> guardamos subscriptionId en estado y habilitamos el submit
  // 2) Luego el usuario envía el formulario -> creamos cuenta + insert en tabla users con paypal_subscription_id, paypal_status='pending'
  //    El webhook de PayPal (en Supabase) actualizará paypal_status a 'active' y pondrá is_premium=true.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Debes aceptar los términos y privacidad.');
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

      // Inserta en tabla users (si ya existe fila por triggers, puedes usar upsert)
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          industry: formData.industry,
          // Deja is_premium false; el webhook de PayPal lo pondrá en true al ACTIVAR
          is_premium: false,
          paypal_subscription_id: subscriptionId,
          paypal_status: 'pending', // lo actualizará el webhook a 'active'
          created_at: new Date()
        }]);
      if (insertError) {
        // Si tuvieras una fila previa, puedes hacer un update en su lugar:
        // await supabase.from('users').update({ paypal_subscription_id: subscriptionId, paypal_status: 'pending' }).eq('id', userId);
        throw insertError;
      }

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
              <div className="w-6 h-6" dangerouslySetInnerHTML={{
                __html: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>`
              }} />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl md:text-2xl leading-6 font-bold text-gray-900 mb-6">
                  Crear una cuenta
                </h3>

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

                  {/* PayPal Subscriptions */}
                  {!paid ? (
                    <PayPalScriptProvider
                      options={{
                        'client-id': PAYPAL_CLIENT_ID,
                        vault: true,
                        intent: 'subscription', // clave para suscripciones
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe' }}
                        createSubscription={(data, actions) => {
                          // Crea la suscripción con tu plan LIVE
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
