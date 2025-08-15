import React, { useState } from 'react';

const RequirementsSection = ({ onLimitReached }) => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [productName, setProductName] = useState('');
  const [selectedOriginCountry, setSelectedOriginCountry] = useState(''); // Nuevo estado para país de origen
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState(null);

  const countries = [
    'Estados Unidos', 'Canadá', 'México', 'Brasil', 'Colombia', 
    'Reino Unido', 'España', 'Francia', 'Alemania', 'Italia',
    'China', 'Japón', 'Corea del Sur', 'Australia', 'India',
    'Argentina', 'Chile', 'Perú', 'Ecuador', 'Uruguay', 'Paraguay',
    'Bolivia', 'Venezuela', 'Cuba', 'República Dominicana', 'Guatemala',
    'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá'
  ];

  const generateRequirementsMockData = (product, country, originCountry) => {
    const productHash = product.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const countryHash = country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const originHash = originCountry.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = productHash + countryHash + originHash;
    const random = (s) => {
      let x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    const arancelOptions = [
      { type: 'Arancel', description: 'Impuesto del 5% sobre el valor CIF' },
      { type: 'Arancel', description: 'Impuesto del 8% sobre el valor FOB' },
      { type: 'Arancel', description: 'Impuesto del 2% sobre el valor comercial' },
      { type: 'IVA', description: 'Impuesto al valor agregado del 16%' },
      { type: 'IVA', description: 'Impuesto al valor agregado del 19%' },
      { type: 'IVA', description: 'Impuesto al valor agregado del 10%' },
    ];

    const nonArancelOptions = [
      { type: 'Certificado de Origen', description: 'Documento que acredita el origen de la mercancía' },
      { type: 'Certificado Fitosanitario', description: 'Emitido por autoridad competente del país exportador' },
      { type: 'Etiquetado', description: 'Debe incluir información en el idioma local' },
      { type: 'Registro Sanitario', description: 'Registro ante la autoridad sanitaria local' },
      { type: 'Licencia de Importación', description: 'Permiso especial para la importación de ciertos bienes' },
      { type: 'Inspección Pre-embarque', description: 'Revisión de la mercancía antes de su envío' },
      { type: 'Normas Técnicas', description: 'Cumplimiento de estándares de calidad y seguridad' },
    ];

    const exportRequirementsOptions = [
      { type: 'Permiso de Exportación', description: `Emitido por la Secretaría de Economía de ${originCountry}` },
      { type: 'Certificado de Calidad', description: `Asegura que el producto de ${originCountry} cumple con estándares internacionales` },
      { type: 'Inspección Aduanal', description: `Revisión de la mercancía en la aduana de ${originCountry}` },
      { type: 'Factura Comercial', description: `Documento fiscal de ${originCountry} para la exportación` },
      { type: 'Lista de Empaque', description: `Detalle de la mercancía para la aduana de ${originCountry}` },
    ];

    const getRandomItems = (arr, count, currentSeed) => {
      const shuffled = arr.sort(() => 0.5 - random(currentSeed));
      return shuffled.slice(0, count).map(item => ({ ...item, required: true }));
    };

    return {
      product: product,
      country: country,
      originCountry: originCountry,
      arancelRequirements: getRandomItems(arancelOptions, 2, seed + 1),
      nonArancelRequirements: getRandomItems(nonArancelOptions, 3, seed + 2),
      exportRequirements: getRandomItems(exportRequirementsOptions, 2, seed + 3),
      additionalInfo: `Para exportar ${product} de ${originCountry} a ${country}, se recomienda encarecidamente consultar con un especialista en aduanas local para la información más reciente y precisa.`
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCountry || !productName.trim() || !selectedOriginCountry.trim()) return;

    // Verificar límite de consultas (solo para usuarios no premium, aunque este componente está en premium dashboard)
    // Se mantiene la lógica para consistencia, pero en un entorno real, esta verificación podría omitirse aquí.
    if (localStorage.getItem('isPremiumUser') !== 'true') {
      let queryCount = parseInt(localStorage.getItem('queryCount') || '0');
      if (queryCount >= 10) { 
        onLimitReached();
        return;
      }
      localStorage.setItem('queryCount', (queryCount + 1).toString());
    }
    
    setIsLoading(true);
    setRequirements(null); // Limpiar resultados anteriores

    try {
      // Simulación de respuesta de la IA con datos dinámicos
      const data = generateRequirementsMockData(productName, selectedCountry, selectedOriginCountry);

      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      setRequirements(data);
    } catch (error) {
      console.error("Error al obtener requisitos con IA:", error);
      setRequirements({ error: "No se pudo obtener la información de requisitos. Intenta de nuevo más tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="requirements" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">¿Qué necesita tu producto para entrar/salir del país?</h2>
          <p className="text-center text-gray-600 mb-8 text-base md:text-lg">
            Descubre los requisitos arancelarios y no arancelarios para exportar e importar tu producto
          </p>
          
          <div className="bg-gray-50 rounded-xl shadow-lg p-4 md:p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre o fracción arancelaria del producto
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej: Aguacate, Textiles, 8471.30.01..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="origin-country-select" className="block text-sm font-medium text-gray-700 mb-1">
                  País de Origen
                </label>
                <select
                  id="origin-country-select"
                  value={selectedOriginCountry}
                  onChange={(e) => setSelectedOriginCountry(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  required
                >
                  <option value="">Selecciona un país de origen</option>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">
                  País de Destino
                </label>
                <select
                  id="country-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  required
                >
                  <option value="">Selecciona un país de destino</option>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Consultando...
                    </span>
                  ) : (
                    'Consultar requisitos'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {requirements && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 animate-fade-in">
              {requirements.error ? (
                <p className="text-red-500 text-center text-base">{requirements.error}</p>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-semibold mb-4">
                    Requisitos para exportar <span className="text-green-600">{requirements.product}</span> de <span className="text-green-600">{requirements.originCountry}</span> a <span className="text-green-600">{requirements.country}</span>
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3 text-gray-800">Requisitos de Exportación (País de Origen)</h4>
                    <ul className="space-y-3">
                      {requirements.exportRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{req.type}</p>
                            <p className="text-sm text-gray-500">{req.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3 text-gray-800">Requisitos de Importación (País de Destino)</h4>
                    <ul className="space-y-3">
                      {requirements.arancelRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{req.type}</p>
                            <p className="text-sm text-gray-500">{req.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3 text-gray-800">Regulaciones No Arancelarias (País de Destino)</h4>
                    <ul className="space-y-3">
                      {requirements.nonArancelRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{req.type}</p>
                            <p className="text-sm text-gray-500">{req.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Nota importante:</span> Para conocer más detalles accede al plan premium, dónde podrás hablar con Asesores Especializados en Exportaciones.
                    </p>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">¿Quieres ver el análisis completo con todos los requisitos y trámites detallados?</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                      Ver reporte completo
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RequirementsSection;