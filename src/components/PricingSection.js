// PricingSection.js
import React from 'react';

const PricingSection = ({ onOpenRegister }) => {
  const plans = [
    {
      name: 'Premium',
      price: '$49usd',
      period: 'mes',
      
      description: 'Para empresas comprometidas con la expansión internacional y la búsqueda activa de nuevos mercados.',
      features: [
        'Consultas Ilimitadas',
        'Encuentra clientes y distribuidores reales en mercados internacionales',
        'Accede a guías claras sobre trámites y requisitos de exportación',
        'Valida demanda con estudios de mercado automatizados',
        'Lanza campañas de prospección con prospectos verificados (1 al mes incluido)',
        'Resuelve dudas al instante 24/7 con nuestro Chat IA experto',
        'Recibe asesorías por videollamada con especialistas en comercio exterior',
        'Capacítate con talleres y cursos continuos para exportadores',
        'Mantente al día con noticias y alertas sobre oportunidades globales'
      ],
      cta: 'Obtén 7 días de Prueba Gratis. Plan Premium',
      highlighted: true
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Plan diseñado para impulsar tu negocio global</h2>
          <p className="text-lg text-gray-600">
            Desbloquea el potencial de tu producto
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`flex-1 rounded-2xl overflow-hidden ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-xl transform lg:-translate-y-4' 
                  : 'bg-white shadow-lg'
              }`}
            >
              <div className="p-4 md:p-8">
                <h3 className={`text-2xl font-bold mb-4 ${plan.highlighted ? 'text-white' : 'text-gray-800'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className={`text-4xl md:text-5xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg md:text-xl ml-2 ${plan.highlighted ? 'text-green-100' : 'text-gray-500'}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`mb-6 text-base ${plan.highlighted ? 'text-green-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm md:text-base">
                      <div className={`flex-shrink-0 h-5 w-5 ${plan.highlighted ? 'text-green-200' : 'text-green-500'} mt-0.5`}>
                        {feature.includes('Gestión para Prospección Masiva de Compradores') ? (
                          <span className="text-yellow-400">⭐</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`ml-3 ${plan.highlighted ? 'text-green-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onOpenRegister} // 🔹 Aquí abrimos el modal de registro
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors text-base ${
                    plan.highlighted 
                      ? 'bg-white text-green-600 hover:bg-green-50' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
