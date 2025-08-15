import React from 'react';

const SubscriptionModal = ({ isOpen, onClose, onOpenRegister }) => {
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
              <div className="w-6 h-6" dangerouslySetInnerHTML={{__html: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>`}} />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl md:text-2xl leading-6 font-bold text-gray-900 mb-4">
                  ¡Límite de consultas alcanzado!
                </h3>
                <p className="text-gray-600 mb-6 text-base">
                  Para seguir explorando oportunidades de comercio internacional, suscríbete a nuestro plan Premium.
                </p>
                
                <div className="space-y-4">
                  <div className="border border-green-700 rounded-lg p-4 bg-green-100">
                    <h4 className="text-lg font-semibold text-green-900 mb-2">Plan Premium</h4>
                    <p className="text-green-800 mb-3 text-sm">
                      * Consultas Ilimitadas
                      * Búsqueda Ilimitada de mercados
                      * Directorio completo de compradores 
                      ⭐ Gestión para Prospección Masiva de Compradores
                      * Capacitación/Curso (De Cero a Exportador)
                      * Servicio de Asesoría (1 hora/semana)
                      * Alerta de oportunidades comerciales
                      * Actualizaciones Mensuales
                      * Soporte 24/7 por email.
                    </p>
                    <button 
                      onClick={() => {
                        onClose();           // Cierra el modal actual
                        onOpenRegister();   // Abre el modal de registro
                      }}
                      className="w-full py-2 px-4 bg-green-800 text-white rounded-lg font-medium hover:bg-green-900 transition-colors text-base"
                    >
                      Suscribirse al Plan Premium ($49/mes)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
