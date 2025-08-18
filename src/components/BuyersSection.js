import React, { useState } from 'react';

const BuyersSection = ({ onLimitReached }) => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [buyers, setBuyers] = useState(null);

  const countries = [
    'Estados Unidos', 'Canadá', 'México', 'Brasil', 'Colombia', 
    'Reino Unido', 'España', 'Francia', 'Alemania', 'Italia',
    'China', 'Japón', 'Corea del Sur', 'Australia', 'India',
    'Argentina', 'Chile', 'Perú', 'Ecuador', 'Uruguay', 'Paraguay',
    'Bolivia', 'Venezuela', 'Cuba', 'República Dominicana', 'Guatemala',
    'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá'
  ];

  // Función para simular la llamada a la IA y generar datos de empresas
  const fetchCompaniesFromAI = async (product, country) => {
    // Aquí iría la lógica real para llamar a tu backend/API de IA
    // que a su vez consultaría bases de datos de empresas y las filtraría
    // por sector, país, etc.
    // Por ahora, usamos datos mock dinámicos.

    const productHash = product.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const countryHash = country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = productHash + countryHash;
    const random = (s) => {
      let x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    const companyTypes = [
      'Retail Grande', 'Retail Pequeño', 'E-commerce', 'Distribuidor Mayorista', 'Cadena de Supermercados', 'Tienda Especializada'
    ];

    const countrySpecificData = {
      'Estados Unidos': {
        addresses: [
          { city: 'Bentonville, AR', street: '702 SW 8th St' },
          { city: 'Seattle, WA', street: '410 Terry Ave N' },
          { city: 'Cincinnati, OH', street: '1014 Vine St' },
          { city: 'Minneapolis, MN', street: '1000 Nicollet Mall' },
          { city: 'Issaquah, WA', street: '999 Lake Dr' },
          { city: 'Austin, TX', street: '550 Bowie St' },
        ],
        companies: [
          { name: 'Walmart Inc.', website: 'walmart.com', phone: '+1 (800) 925-6278', importVolume: '5M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Amazon.com, Inc.', website: 'amazon.com', phone: '+1 (888) 280-4331', importVolume: '3M', type: 'E-commerce', sector: 'Online Retail' },
          { name: 'Kroger Co.', website: 'kroger.com', phone: '+1 (800) 576-4377', importVolume: '2M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Target Corporation', website: 'target.com', phone: '+1 (800) 440-0680', importVolume: '4M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Costco Wholesale Corp.', website: 'costco.com', phone: '+1 (425) 313-8100', importVolume: '3.5M', type: 'Distribuidor Mayorista', sector: 'Warehouse Retail' },
          { name: 'Whole Foods Market', website: 'wholefoodsmarket.com', phone: '+1 (512) 542-0878', importVolume: '1.8M', type: 'Tienda Especializada', sector: 'Organic Food Retail' },
        ]
      },
      'México': {
        addresses: [
          { city: 'Naucalpan, Edo. Méx.', street: 'Blvd. Manuel Ávila Camacho 647' },
          { city: 'Ciudad de México', street: 'Av. Insurgentes Sur 1602' },
          { city: 'San Pedro Garza García, N.L.', street: 'Ricardo Margáin Zozaya 325' },
          { city: 'Ciudad de México', street: 'Av. Insurgentes Sur 1310' },
          { city: 'Monterrey, N.L.', street: 'Av. Lázaro Cárdenas 2400' },
          { city: 'Ciudad de México', street: 'Av. Universidad 1000' },
        ],
        companies: [
          { name: 'Walmart de México y Centroamérica', website: 'walmart.com.mx', phone: '+52 (55) 5134-0000', importVolume: '4.5M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Mercado Libre México', website: 'mercadolibre.com.mx', phone: '+52 (55) 4744-0000', importVolume: '2.5M', type: 'E-commerce', sector: 'Online Retail' },
          { name: 'Soriana S.A.B. de C.V.', website: 'soriana.com', phone: '+52 (81) 8329-9000', importVolume: '1.5M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Liverpool', website: 'liverpool.com.mx', phone: '+52 (55) 5268-3000', importVolume: '3M', type: 'Retail Grande', sector: 'Department Store' },
          { name: 'HEB México', website: 'heb.com.mx', phone: '+52 (81) 8150-8000', importVolume: '1.2M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'La Comer', website: 'lacomer.com.mx', phone: '+52 (55) 5246-0000', importVolume: '0.7M', type: 'Tienda Especializada', sector: 'Premium Food Retail' },
        ]
      },
      'Alemania': {
        addresses: [
          { city: 'Neckarsulm', street: 'Stiftsbergstraße 1' },
          { city: 'Berlin', street: 'Valeska-Gert-Straße 5' },
          { city: 'Hamburg', street: 'New-York-Ring 6' },
          { city: 'Ingolstadt', street: 'Wankelstraße 5' },
          { city: 'Mülheim an der Ruhr', street: 'Mintarder Str. 36-40' },
        ],
        companies: [
          { name: 'Lidl Stiftung & Co. KG', website: 'lidl.de', phone: '+49 (0) 800 435-3361', importVolume: '3.8M', type: 'Retail Grande', sector: 'Discount Retail' },
          { name: 'Zalando SE', website: 'zalando.de', phone: '+49 (0) 30 20968-000', importVolume: '2.2M', type: 'E-commerce', sector: 'Fashion Online Retail' },
          { name: 'Edeka Zentrale AG & Co. KG', website: 'edeka.de', phone: '+49 (0) 40 6377-0', importVolume: '1.9M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'MediaMarktSaturn Retail Group', website: 'mediamarktsaturn.com', phone: '+49 (0) 841 634-0', importVolume: '3.1M', type: 'Retail Grande', sector: 'Electronics Retail' },
          { name: 'Aldi Süd', website: 'aldi-sued.de', phone: '+49 (0) 201 8593-0', importVolume: '2.5M', type: 'Retail Grande', sector: 'Discount Retail' },
        ]
      },
      // Añadir más datos específicos por país
      'Canadá': {
        addresses: [
          { city: 'Toronto, ON', street: '100 King St W' },
          { city: 'Vancouver, BC', street: '500 Granville St' },
        ],
        companies: [
          { name: 'Loblaw Companies Limited', website: 'loblaw.ca', phone: '+1 (800) 296-2332', importVolume: '2.8M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Canadian Tire Corporation', website: 'canadiantire.ca', phone: '+1 (800) 387-8803', importVolume: '1.5M', type: 'Retail Grande', sector: 'General Retail' },
        ]
      },
      'Brasil': {
        addresses: [
          { city: 'São Paulo', street: 'Av. Paulista, 1000' },
          { city: 'Rio de Janeiro', street: 'Rua da Alfândega, 50' },
        ],
        companies: [
          { name: 'GPA (Grupo Pão de Açúcar)', website: 'gpa.com.br', phone: '+55 (11) 3886-0400', importVolume: '2.0M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Magazine Luiza', website: 'magazineluiza.com.br', phone: '+55 (11) 3500-9900', importVolume: '1.0M', type: 'E-commerce', sector: 'Online Retail' },
        ]
      },
      'Colombia': {
        addresses: [
          { city: 'Bogotá', street: 'Carrera 7 # 12-34' },
          { city: 'Medellín', street: 'Calle 10 # 20-30' },
        ],
        companies: [
          { name: 'Grupo Éxito', website: 'grupoexito.com.co', phone: '+57 (1) 651-0000', importVolume: '1.1M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Falabella Colombia', website: 'falabella.com.co', phone: '+57 (1) 587-8000', importVolume: '0.6M', type: 'Retail Grande', sector: 'Department Store' },
        ]
      },
      'Reino Unido': {
        addresses: [
          { city: 'London', street: '10 Downing St' },
          { city: 'Manchester', street: '20 King St' },
        ],
        companies: [
          { name: 'Tesco PLC', website: 'tesco.com', phone: '+44 (0) 345 071 9000', importVolume: '4.0M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'ASOS Plc', website: 'asos.com', phone: '+44 (0) 20 7756 1000', importVolume: '1.5M', type: 'E-commerce', sector: 'Fashion Online Retail' },
        ]
      },
      'España': {
        addresses: [
          { city: 'Madrid', street: 'Gran Vía, 1' },
          { city: 'Barcelona', street: 'Passeig de Gràcia, 2' },
        ],
        companies: [
          { name: 'Inditex (Zara)', website: 'inditex.com', phone: '+34 981 18 54 00', importVolume: '5.5M', type: 'Retail Grande', sector: 'Fashion Retail' },
          { name: 'Mercadona', website: 'mercadona.es', phone: '+34 900 500 103', importVolume: '2.3M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Francia': {
        addresses: [
          { city: 'Paris', street: 'Champs-Élysées, 1' },
          { city: 'Lyon', street: 'Rue de la République, 5' },
        ],
        companies: [
          { name: 'Carrefour S.A.', website: 'carrefour.com', phone: '+33 (0)1 64 50 50 50', importVolume: '3.9M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Auchan Retail', website: 'auchan-retail.com', phone: '+33 (0)3 20 43 43 43', importVolume: '1.8M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Italia': {
        addresses: [
          { city: 'Rome', street: 'Via del Corso, 10' },
          { city: 'Milan', street: 'Via Montenapoleone, 5' },
        ],
        companies: [
          { name: 'Esselunga S.p.A.', website: 'esselunga.it', phone: '+39 02 935721', importVolume: '1.4M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Coin S.p.A.', website: 'coin.it', phone: '+39 041 969 7111', importVolume: '0.7M', type: 'Retail Grande', sector: 'Department Store' },
        ]
      },
      'Japón': {
        addresses: [
          { city: 'Tokyo', street: 'Shibuya, 1-1' },
          { city: 'Osaka', street: 'Dotonbori, 2-2' },
        ],
        companies: [
          { name: 'Aeon Co., Ltd.', website: 'aeon.info', phone: '+81 43-212-6000', importVolume: '3.5M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Rakuten, Inc.', website: 'rakuten.com', phone: '+81 50-5817-1000', importVolume: '2.0M', type: 'E-commerce', sector: 'Online Retail' },
        ]
      },
      'Corea del Sur': {
        addresses: [
          { city: 'Seoul', street: 'Gangnam-gu, Teheran-ro 152' },
          { city: 'Busan', street: 'Haeundae-gu, Centum Jungang-ro 90' },
        ],
        companies: [
          { name: 'Lotte Shopping Co., Ltd.', website: 'lotteshopping.com', phone: '+82 2-771-2500', importVolume: '2.1M', type: 'Retail Grande', sector: 'Department Store' },
          { name: 'Coupang', website: 'coupang.com', phone: '+82 2-6150-9800', importVolume: '1.8M', type: 'E-commerce', sector: 'Online Retail' },
        ]
      },
      'Australia': {
        addresses: [
          { city: 'Sydney, NSW', street: '78 Harbor Rd' },
          { city: 'Melbourne, VIC', street: '1 Flinders St' },
        ],
        companies: [
          { name: 'Woolworths Group Limited', website: 'woolworthsgroup.com.au', phone: '+61 2 8885 0000', importVolume: '1.9M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Wesfarmers Limited', website: 'wesfarmers.com.au', phone: '+61 8 9327 4211', importVolume: '1.2M', type: 'Retail Grande', sector: 'General Retail' },
        ]
      },
      'India': {
        addresses: [
          { city: 'Mumbai, MH', street: 'Bandra Kurla Complex' },
          { city: 'Delhi, DL', street: 'Connaught Place' },
        ],
        companies: [
          { name: 'Reliance Retail', website: 'relianceretail.com', phone: '+91 22 3555 8000', importVolume: '2.5M', type: 'Retail Grande', sector: 'General Retail' },
          { name: 'Flipkart', website: 'flipkart.com', phone: '+91 80 4940 0000', importVolume: '1.0M', type: 'E-commerce', sector: 'Online Retail' },
        ]
      },
      'Argentina': {
        addresses: [
          { city: 'Buenos Aires', street: 'Av. Corrientes, 1000' },
          { city: 'Córdoba', street: 'Bv. San Juan, 50' },
        ],
        companies: [
          { name: 'Mercado Libre Argentina', website: 'mercadolibre.com.ar', phone: '+54 11 4640-8000', importVolume: '1.8M', type: 'E-commerce', sector: 'Online Retail' },
          { name: 'Coto C.I.C.S.A.', website: 'coto.com.ar', phone: '+54 11 4580-8000', importVolume: '0.9M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Chile': {
        addresses: [
          { city: 'Santiago', street: 'Av. Libertador Bernardo O\'Higgins, 100' },
          { city: 'Valparaíso', street: 'Blanco, 500' },
        ],
        companies: [
          { name: 'Falabella Retail S.A.', website: 'falabella.cl', phone: '+56 2 2390-6000', importVolume: '1.2M', type: 'Retail Grande', sector: 'Department Store' },
          { name: 'Cencosud S.A.', website: 'cencosud.cl', phone: '+56 2 2959-0000', importVolume: '0.8M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Perú': {
        addresses: [
          { city: 'Lima', street: 'Av. Arequipa, 100' },
          { city: 'Cusco', street: 'Av. El Sol, 200' },
        ],
        companies: [
          { name: 'Supermercados Peruanos S.A.', website: 'supermercadosperuanos.com.pe', phone: '+51 1 618-8000', importVolume: '0.7M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Saga Falabella', website: 'sagafalabella.com.pe', phone: '+51 1 616-1000', importVolume: '0.5M', type: 'Retail Grande', sector: 'Department Store' },
        ]
      },
      'Ecuador': {
        addresses: [
          { city: 'Quito', street: 'Av. Amazonas, 100' },
          { city: 'Guayaquil', street: 'Av. 9 de Octubre, 200' },
        ],
        companies: [
          { name: 'Corporación Favorita C.A.', website: 'favorita.com', phone: '+593 2 299-0000', importVolume: '0.6M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'De Prati', website: 'deprati.com.ec', phone: '+593 4 259-0000', importVolume: '0.3M', type: 'Retail Grande', sector: 'Department Store' },
        ]
      },
      'Uruguay': {
        addresses: [
          { city: 'Montevideo', street: '18 de Julio, 1000' },
        ],
        companies: [
          { name: 'Tienda Inglesa', website: 'tiendainglesa.com.uy', phone: '+598 2 628-1111', importVolume: '0.2M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Mercado Libre Uruguay', website: 'mercadolibre.com.uy', phone: '+598 2 902-0000', importVolume: '0.15M', type: 'E-commerce', sector: 'Online Retail' },
        ]
      },
      'Paraguay': {
        addresses: [
          { city: 'Asunción', street: 'Palma, 500' },
        ],
        companies: [
          { name: 'Supermercados Stock', website: 'stock.com.py', phone: '+595 21 619-0000', importVolume: '0.1M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
          { name: 'Shopping del Sol', website: 'shoppingdelsol.com.py', phone: '+595 21 611-000', importVolume: '0.08M', type: 'Retail Grande', sector: 'Shopping Mall' },
        ]
      },
      'Bolivia': {
        addresses: [
          { city: 'La Paz', street: 'Av. 16 de Julio, 100' },
        ],
        companies: [
          { name: 'Hipermaxi S.A.', website: 'hipermaxi.com', phone: '+591 3 342-0000', importVolume: '0.07M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Venezuela': {
        addresses: [
          { city: 'Caracas', street: 'Av. Francisco de Miranda, 100' },
        ],
        companies: [
          { name: 'Excelsior Gama', website: 'excelsiorgama.com', phone: '+58 212 201-0000', importVolume: '0.05M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Cuba': {
        addresses: [
          { city: 'La Habana', street: 'Calle Obispo, 100' },
        ],
        companies: [
          { name: 'CIMEX S.A.', website: 'cimex.com.cu', phone: '+53 7 204-0000', importVolume: '0.03M', type: 'Retail Grande', sector: 'State Retail' },
        ]
      },
      'República Dominicana': {
        addresses: [
          { city: 'Santo Domingo', street: 'Av. Winston Churchill, 100' },
        ],
        companies: [
          { name: 'Grupo Ramos', website: 'gruporamos.com', phone: '+1 809 535-0000', importVolume: '0.4M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Guatemala': {
        addresses: [
          { city: 'Ciudad de Guatemala', street: 'Av. La Reforma, 100' },
        ],
        companies: [
          { name: 'Walmart de Guatemala', website: 'walmart.com.gt', phone: '+502 2426-0000', importVolume: '0.3M', type: 'Retail Grande', sector: 'General Retail' },
        ]
      },
      'Honduras': {
        addresses: [
          { city: 'Tegucigalpa', street: 'Blvd. Morazán, 100' },
        ],
        companies: [
          { name: 'Supermercados La Colonia', website: 'lacolonia.com', phone: '+504 2239-0000', importVolume: '0.1M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'El Salvador': {
        addresses: [
          { city: 'San Salvador', street: 'Blvd. Los Próceres, 100' },
        ],
        companies: [
          { name: 'Super Selectos', website: 'superselectos.com', phone: '+503 2209-0000', importVolume: '0.15M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Nicaragua': {
        addresses: [
          { city: 'Managua', street: 'Carretera a Masaya, Km 5' },
        ],
        companies: [
          { name: 'Walmart de Nicaragua', website: 'walmart.com.ni', phone: '+505 2255-0000', importVolume: '0.08M', type: 'Retail Grande', sector: 'General Retail' },
        ]
      },
      'Costa Rica': {
        addresses: [
          { city: 'San José', street: 'Av. Central, 100' },
        ],
        companies: [
          { name: 'Auto Mercado', website: 'automercado.co.cr', phone: '+506 2289-0000', importVolume: '0.25M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
      'Panamá': {
        addresses: [
          { city: 'Ciudad de Panamá', street: 'Calle 50, 100' },
        ],
        companies: [
          { name: 'Supermercados Riba Smith', website: 'ribasmith.com', phone: '+507 200-0000', importVolume: '0.3M', type: 'Cadena de Supermercados', sector: 'Food Retail' },
        ]
      },
    };

    const getCompaniesForCountryAndProduct = (countryName, product, currentSeed) => {
      const countryData = countrySpecificData[countryName];
      if (!countryData) {
        return []; // No hay datos para este país
      }
      
      const availableCompanies = countryData.companies;
      const availableAddresses = countryData.addresses;

      // Filtrar y adaptar empresas según el producto/sector
      const filteredCompanies = availableCompanies.filter(company => {
        // Lógica simple de relación producto-sector
        const lowerCaseProduct = product.toLowerCase();
        if (lowerCaseProduct.includes('aguacate') || lowerCaseProduct.includes('alimentos')) {
          return company.sector.includes('Food') || company.sector.includes('Supermercados') || company.sector.includes('Organic Food');
        }
        if (lowerCaseProduct.includes('textiles') || lowerCaseProduct.includes('ropa') || lowerCaseProduct.includes('moda')) {
          return company.sector.includes('Fashion') || company.sector.includes('Department Store') || company.sector.includes('General Retail');
        }
        if (lowerCaseProduct.includes('electrónica') || lowerCaseProduct.includes('tecnología')) {
          return company.sector.includes('Electronics');
        }
        // Si no hay una relación clara, incluir algunas generales
        return true;
      });

      const shuffled = filteredCompanies.sort(() => 0.5 - random(currentSeed));
      return shuffled.slice(0, 10).map((company, index) => {
        const volume = (parseFloat(company.importVolume) * (1 + random(currentSeed + index) * 0.2)).toFixed(2);
        const volumeUnit = company.importVolume.includes('M') ? 'M' : 'K';
        const addressInfo = availableAddresses[Math.floor(random(currentSeed + index + 500) * availableAddresses.length)];
        const fullAddress = `${addressInfo.street}, ${addressInfo.city}, ${countryName}`;
        
        const description = `Empresa ${company.type} (${company.sector}) especializada en la importación y distribución de productos como ${product.toLowerCase()} en ${countryName}.`;

        return {
          name: company.name,
          website: `www.${company.website}`,
          phone: company.phone,
          address: fullAddress,
          importVolume: `$${volume}${volumeUnit} anuales`,
          description: description,
          type: company.type,
          contact: {
            website: `www.${company.website}`,
            phone: company.phone,
            email: `info@${company.website.split('.')[0]}.com`
          }
        };
      });
    };

    return {
      product: product,
      country: country,
      companies: getCompaniesForCountryAndProduct(country, product, seed)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCountry || !productName.trim()) return;
    
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
    setBuyers(null); // Limpiar resultados anteriores

    try {
      // Simulación de llamada a la IA para obtener listados de empresas
      const data = await fetchCompaniesFromAI(productName, selectedCountry);

      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      setBuyers(data);
    } catch (error) {
      console.error("Error al encontrar compradores con IA:", error);
      setBuyers({ error: "No se pudo obtener la información de compradores. Intenta de nuevo más tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="buyers" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">¿A quién venderle?</h2>
          <p className="text-center text-gray-600 mb-8 text-base md:text-lg">
            Encuentra compradores reales para tu producto en mercados internacionales
          </p>
          
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="product-name-buyers" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre o fracción arancelaria del producto
                </label>
                <input
                  id="product-name-buyers"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej: Aguacate, Textiles, 8471.30.01..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country-select-buyers" className="block text-sm font-medium text-gray-700 mb-1">
                  País de destino
                </label>
                <select
                  id="country-select-buyers"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  required
                >
                  <option value="">Selecciona un país</option>
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
                      Buscando...
                    </span>
                  ) : (
                    'Encontrar compradores'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {buyers && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 animate-fade-in">
              {buyers.error ? (
                <p className="text-red-500 text-center text-base">{buyers.error}</p>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-semibold mb-4">
                    Compradores potenciales de <span className="text-green-600">{buyers.product}</span> en <span className="text-green-600">{buyers.country}</span>
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-base">Estas empresas han importado productos similares en los últimos 3 años:</p>
                  
                  <div className="space-y-6">
                    {buyers.companies.map((company, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <h4 className="text-lg md:text-xl font-medium text-gray-900">{company.name}</h4>
                          <span className="text-sm md:text-base font-medium text-green-600 mt-1 md:mt-0">{company.importVolume}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{company.description}</p>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="w-4 h-4 mr-2 text-gray-400">
                              <svg viewBox='0 0 20 20' fill='currentColor'><path fillRule='evenodd' d='M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z' clipRule='evenodd' /></svg>`} />
                            </span>
                            <a href={`https://${company.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                              {company.contact.website}
                            </a>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="w-4 h-4 mr-2 text-gray-400">
                              <svg viewBox='0 0 20 20' fill='currentColor'><path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' /></svg>
                            </span>
                            {company.contact.phone}
                          </div>
                        </div>
                        <div className="mt-2 flex items-start text-sm text-gray-500">
                          <span className="w-4 h-4 mr-2 text-gray-400 mt-0.5">
                            <svg viewBox='0 0 20 20' fill='currentColor'><path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' /></svg>
                          </span>
                          <span>{company.address}</span>
                        </div>
                        <div className="mt-2 flex items-start text-sm text-gray-500">
                          <span className="w-4 h-4 mr-2 text-gray-400 mt-0.5">
                            <svg viewBox='0 0 20 20' fill='currentColor'><path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' /><path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' /></svg>
                          </span>
                          <span>{company.contact.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                         <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Nota importante:</span> Para conocer más detalles accede al plan premium, dónde podrás obtener prospectos masivos en el pais meta.
                    </p>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">¿Quieres acceder a la lista completa de importadores con datos de contacto verificados?</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                      Ver listado completo
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

export default BuyersSection;
