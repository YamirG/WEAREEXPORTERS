import React, { useMemo, useState } from 'react';
import { COUNTRIES, EXPORT_PROCEDURES, BRAND } from '../../lib/tramitologia/constants';
import { fetchManual } from '../../lib/tramitologia/fetchManual';
import ManualCard from './ManualCard';
import { exportGuide } from '../../lib/pdf/exportGuide';
import { Button, Input, Select, Alert, Loader, Badge } from '../ui';

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Badge variant="success">Exportar</Badge>
          <span className="text-xs text-gray-400">
            Generación automática de guía documental
          </span>
        </div>

        <form onSubmit={onGenerate} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Select
              id="country"
              name="country"
              label="País de origen"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>

            <div className="lg:col-span-2">
              <Input
                id="hscode"
                name="hsCode"
                label="Producto / HS Code"
                type="text"
                placeholder="Ej. 0804.40 (aguacate) o 'aguacate fresco'"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Opcional: úsalo para personalizar el resumen y el PDF.
              </p>
            </div>

            <Select
              id="procedure"
              name="procedure"
              label="Tipo de trámite"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              required
            >
              {EXPORT_PROCEDURES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Listo para generar tu guía
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Se incluirán pasos, requisitos, autoridad, enlaces oficiales y manual complementario.
              </p>
            </div>

            <Button
              type="submit"
              variant="secondary"
              disabled={loading || !country || !procedure}
              className="w-full sm:w-auto"
            >
              {loading ? 'Generando…' : 'Generar Guía'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-5">
            <Alert variant="danger">{error}</Alert>
          </div>
        )}

        {loading && (
          <div className="mt-5">
            <Loader text="Construyendo guía de exportación…" />
          </div>
        )}
      </div>

      {manual && (
        <div>
          <ManualCard manual={manual} onDownloadPdf={() => exportGuide(manual)} />
        </div>
      )}
    </div>
  );
}
