import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Equipo de Vendedores Internacionales',
      description: 'Genera Prospectos calificados y validados de forma masiva accediendo al área Premium.',
      icon: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><path d='m12 1v6m0 6v6m11-7h-6m-6 0H1m5.64-7.64l4.24 4.24m6.36 6.36l4.24 4.24M6.64 17.64l4.24-4.24m6.36-6.36l4.24-4.24'></path></svg>`
    },
    {
      title: 'Requisitos de exportación por país',
      description: 'Conoce exactamente qué documentos, certificaciones y trámites necesitas para exportar a cualquier mercado.',
      icon: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='20,6 9,17 4,12'></polyline></svg>`
    },
    {
      title: 'No es un Directorio de Compradores',
      description: 'Listado de Prospectos calificados que ya compran y buscan un producto como el tuyo en mercados internacionales.',
      icon: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path><circle cx='12' cy='7' r='4'></circle></svg>`
    },
    {title: 'Hay un país buscando tu producto',
      description: 'Identificamos la oferta y la demanda, localizamos el país que busca tu producto al instante. ¿No sabes por dónde comenzar?, al acceder también obtienes capacitación constante.',
      icon: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3'></circle><path d='M12 1v6m0 6v6m11-7h-6m-6 0H1m5.64-7.64l4.24 4.24m6.36 6.36l4.24 4.24M6.64 17.64l4.24-4.24m6.36-6.36l4.24-4.24'></path></svg>`
    },
  
    {
      title: 'Alertas de oportunidades comerciales',
      description: 'Recibe notificaciones cuando surjan nuevas oportunidades para tu producto en mercados internacionales.',
      icon: `<svg viewBox='0 0 24 24' fill='currentColor'><path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'></path></svg>`
    },
    {
      title: 'Asesoría especializada en comercio exterior',
      description: 'Accede a expertos que te guiarán en todo el proceso de internacionalización de tu empresa.',
      icon: `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3'></circle><path d='M12 1v6m0 6v6m11-7h-6m-6 0H1m5.64-7.64l4.24 4.24m6.36 6.36l4.24 4.24M6.64 17.64l4.24-4.24m6.36-6.36l4.24-4.24'></path></svg>`
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Herramientas para conquistar mercados globales</h2>
          <p className="text-lg text-gray-600">
            Todo lo que necesitas para identificar oportunidades y vender tus productos internacionalmente
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <div className="w-5 h-5 md:w-6 md:h-6" dangerouslySetInnerHTML={{__html: feature.icon}} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;