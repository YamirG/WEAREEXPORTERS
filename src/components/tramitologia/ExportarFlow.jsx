import React, { useMemo, useState } from 'react';
import { COUNTRIES, EXPORT_PROCEDURES, BRAND } from '../../lib/tramitologia/constants';
import { fetchManual } from '../../lib/tramitologia/fetchManual';
import ManualCard from './ManualCard';
import { exportGuide } from '../../lib/pdf/exportGuide';

export default function ExportarFlow() {
  const [country, setCountry] = useState('MX');
  const [hsCode, setHsCode] = useState('');
  const [procedure, setProcedure] = useState('certificado_origen');
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(null);
  const [error, setError] = useState('');

  const procedureLabel = useMemo(() => {
    const found = EXPORT_PROCEDURES.find((p) => p.key === procedure);
    return found ? found.label : procedure;
  }, [procedure]);

  async function onGenerate(e) {
    e.preventDefault();
    setError('');
    setManual(null);
    setLoading(true);

    try {
      const data = await fetchManual({ country, procedure });

      const normalized = {
        title: data?.title || `${procedureLabel} (${country})`,
        country,
        procedureKey: procedure,
        procedureLabel,
        hsCode: hsCode || '',
        steps: Array.isArray(data?.steps) ? data.steps : [],
        requirements: Array.isArray(data?.requirements) ? data.requirements : [],
        links: Array.isArray(data?.links) ? data.links : [],
        authority: data?.authority || '',
        sla: data?.sla || '',
        fees: data?.fees || '',
        generatedAt: new Date().toISOString(),
        brand: BRAND,
        officialManual: data?.officialManual || null,
      };

      setManual(normalized);
    } catch (err) {
      console.error('Error generando manual:', err);
      setError('No fue posible generar la guía. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 md:p-6">
      <form onSubmit={onGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label htmlFor="country" className="text-sm font-semibold text-gray-700 mb-1">
            País de Origen
          </label>
          <select
            id="country"
            name="country"
            className="border rounded-lg px-3 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:col-span-2">
          <label htmlFor="hscode" className="text-sm font-semibold text-gray-700 mb-1">
            Producto / HS Code (opcional)
          </label>
          <input
            id="hscode"
            name="hsCode"
            type="text"
            placeholder="Ej. 0804.40 (aguacate) o 'aguacate fresco'"
            className="border rounded-lg px-3 py-2"
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="procedure" className="text-sm font-semibold text-gray-700 mb-1">
            Tipo de trámite
          </label>
          <select
            id="procedure"
            name="procedure"
            className="border rounded-lg px-3 py-2"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            required
          >
            {EXPORT_PROCEDURES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={loading || !country || !procedure}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-200
              ${loading || !country || !procedure
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200 active:scale-[0.98]'
              }`}
          >
            {loading ? 'Generando…' : 'Generar Guía'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {manual && (
        <div className="mt-6">
          <ManualCard manual={manual} onDownloadPdf={() => exportGuide(manual)} />
        </div>
      )}
    </div>
  );
}
