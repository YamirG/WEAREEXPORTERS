import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Intentar iniciar sesión
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData?.user) {
      setError('Credenciales inválidas o usuario no registrado');
      setIsLoading(false);
      return;
    }

    const userId = authData.user.id;

    // Consultar datos adicionales del usuario desde tu tabla personalizada
    const { data: userData, error: userFetchError } = await supabase
      .from('users') // Asegúrate de que este sea el nombre exacto de tu tabla
      .select('is_premium')
      .eq('id', userId)
      .single();

    setIsLoading(false);

    if (userFetchError || !userData) {
      console.error('Error al obtener datos del usuario:', userFetchError);
      setError('No se pudo obtener la información del usuario.');
      return;
    }

    onClose();

    if (userData.is_premium) {
      localStorage.setItem('isPremiumUser', 'true');
      navigate('/premiumdashboard');
    } else {
      localStorage.setItem('isPremiumUser', 'false');
      navigate('/dashboard'); // o cualquier otra ruta para usuarios normales
    }
  };

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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl md:text-2xl leading-6 font-bold text-gray-900 mb-6">Iniciar sesión</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />

                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                      <span className="ml-2">Recordarme</span>
                    </label>
                    <a href="#" className="text-sm text-green-600 hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </button>
                </form>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="text-green-600 hover:underline"
                    >
                      Regístrate ahora
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

export default LoginModal;

