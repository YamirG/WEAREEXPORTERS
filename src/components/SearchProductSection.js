import React, { useState } from 'react';

const SearchProductSection = ({ onSearch, onLimitReached }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const generateMockData = (product) => {
    const hash = product.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed) => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const countries = [
      { name: 'Estados Unidos', baseValue: 1.2, baseGrowth: 5.3 },
      { name: 'Alemania', baseValue: 0.78, baseGrowth: 3.1 },
      { name: 'China', baseValue: 0.65, baseGrowth: 8.7 },
      { name: 'Japón', baseValue: 0.42, baseGrowth: 2.2 },
      { name: 'México', baseValue: 0.38, baseGrowth: 4.5 },
      { name: 'Canadá', baseValue: 0.5, baseGrowth: 3.5 },
      { name: 'Reino Unido', baseValue: 0.6, baseGrowth: 2.8 },
      { name: 'Brasil', baseValue: 0.3, baseGrowth: 6.0 },
      { name: 'Australia', baseValue: 0.25, baseGrowth: 4.0 },
      { name: 'India', baseValue: 0.2, baseGrowth: 7.5 },
      { name: 'Argentina', baseValue: 0.15, baseGrowth: 3.0 },
      { name: 'Chile', baseValue: 0.1, baseGrowth: 4.0 },
      { name: 'Perú', baseValue: 0.08, baseGrowth: 5.0 },
      { name: 'Colombia', baseValue: 0.2, baseGrowth: 3.8 },
      { name: 'España', baseValue: 0.4, baseGrowth: 2.5 },
    ];

    const generatedCountries = countries.map((country, index) => {
      const value = (country.baseValue * (1 + random(hash + index) * 0.5)).toFixed(2);
      const growth = (country.baseGrowth * (1 + random(hash + index + 100) * 0.2)).toFixed(1);
      return {
        name: country.name,
        importValue: `$${value}B`,
        growth: `${growth}%`
      };
    }).sort(() => 0.5 - random(hash + 200)).slice(0, 5); // Shuffle and take top 5

    return {
      product: product,
      countries: generatedCountries
    };
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Verificar límite de consultas
    if (localStorage.getItem('isPremiumUser') !== 'true') {
      let queryCount = parseInt(localStorage.getItem('queryCount') || '0');
      if (queryCount >= 10) { // Cambiado a 10 consultas gratuitas
        onLimitReached();
        return;
      }
      localStorage.setItem('queryCount', (queryCount + 1).toString());
    }

    setIsLoading(true);
    setSearchResults(null); // Limpiar resultados anteriores

    try {
      // Simulación de respuesta de la IA con datos dinámicos
      const data = generateMockData(searchTerm);
      
      // Simular un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      setSearchResults(data);
      
      if (onSearch) {
        onSearch(data);
      }
    } catch (error) {
      console.error("Error al buscar el producto con IA:", error);
      setSearchResults({ error: "No se pudo obtener la información. Intenta de nuevo más tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="search-product" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">¿Qué país busca tu producto?</h2>
          <p className="text-center text-gray-600 mb-8 text-base md:text-lg">
            Ingresa el nombre comercial o fracción arancelaria de tu producto para descubrir los mercados con mayor demanda
          </p>
          
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: Aguacate, Textiles, 8471.30.01..."
                className="flex-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Buscando...
                  </span>
                ) : (
                  'Buscar'
                )}
              </button>
            </form>
          </div>
          
          {searchResults && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 animate-fade-in">
              {searchResults.error ? (
                <p className="text-red-500 text-center text-base">{searchResults.error}</p>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-semibold mb-4">Resultados para: <span className="text-green-600">{searchResults.product}</span></h3>
                  <p className="text-gray-600 mb-4 text-base">Países que más importan este producto (últimos 3 años):</p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                          <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor de importación</th>
                          <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crecimiento</th>
                          <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {searchResults.countries.map((country, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{country.name}</td>
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">{country.importValue}</td>
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-green-600">{country.growth}</td>
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm">
                              <button className="text-green-600 hover:text-green-800 font-medium">
                                Ver detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">¿Quieres ver el análisis completo con más países y datos detallados?</p>
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

export default SearchProductSection;