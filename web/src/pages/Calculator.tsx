import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calculator as CalculatorIcon, Save, FileSpreadsheet, RefreshCw, Info, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';

interface Printer {
  id: number;
  nombre: string;
  consumo_w: number;
  precio_maquina: number;
  vida_util_horas: number;
  reparaciones_pct: number;
}

interface Material {
  id: number;
  nombre: string;
  tipo: string;
  cop_por_kg: number;
  merma_pct: number;
}

interface CalculationResult {
  filamento: number;
  electricidad: number;
  mano_obra: number;
  maquina: number;
  otros: number;
  total_costo: number;
  precio_venta_sugerido: number;
}

// Icon constants
const ICON_CALCULATOR = <CalculatorIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_CALCULATOR_SM = <CalculatorIcon className="h-4 w-4" />;
const ICON_CALCULATOR_LG = <CalculatorIcon className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />;
const ICON_SAVE = <Save className="h-4 w-4" />;
const ICON_SPREADSHEET = <FileSpreadsheet className="h-4 w-4" />;
const ICON_REFRESH = <RefreshCw className="h-4 w-4" />;
const ICON_INFO = <Info className="h-4 w-4" />;
const ICON_CHECK = <CheckCircle className="h-4 w-4" />;
const ICON_HASH = <span className="text-neutral-400 dark:text-neutral-500">#</span>;
const ICON_CLOCK = <span className="text-neutral-400 dark:text-neutral-500">🕐</span>;
const ICON_TIMER = <span className="text-neutral-400 dark:text-neutral-500">⏱</span>;
const ICON_SCALE = <span className="text-neutral-400 dark:text-neutral-500">⚖️</span>;
const ICON_THREAD = '🧵';
const ICON_LIGHTNING = '⚡';
const ICON_WORKER = '👷';
const ICON_TOOLS = '🔧';
const ICON_BOX = '📦';

const COST_ITEMS = [
  { key: 'filamento', label: 'Filamento', icon: ICON_THREAD, color: 'brand' },
  { key: 'electricidad', label: 'Electricidad', icon: ICON_LIGHTNING, color: 'warning' },
  { key: 'mano_obra', label: 'Mano de obra', icon: ICON_WORKER, color: 'info' },
  { key: 'maquina', label: 'Máquina + Mantenimiento', icon: ICON_TOOLS, color: 'success' },
  { key: 'otros', label: 'Otros gastos', icon: ICON_BOX, color: 'neutral' },
] as const;

const EMPTY_STATE_CHECKS = [
  { icon: ICON_CHECK, text: 'Filamento con merma' },
  { icon: ICON_CHECK, text: 'Electricidad kWh' },
  { icon: ICON_CHECK, text: 'Mano de obra' },
  { icon: ICON_CHECK, text: 'Amortización máquina' },
] as const;

export const Calculator = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState({
    printer_id: '',
    material_id: '',
    pieces: '1',
    hours: '',
    minutes: '',
    weight: '',
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [printersResp, materialsResp] = await Promise.all([
          api.get('/printers/'),
          api.get('/materials/'),
        ]);
        setPrinters(printersResp.data);
        setMaterials(materialsResp.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const formatCOP = useCallback((value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.printer_id) newErrors.printer_id = 'Selecciona una impresora';
    if (!formData.material_id) newErrors.material_id = 'Selecciona un material';
    if (!formData.pieces || parseInt(formData.pieces) < 1) newErrors.pieces = 'Mínimo 1 pieza';
    const hours = parseFloat(formData.hours) || 0;
    const minutes = parseFloat(formData.minutes) || 0;
    if (hours === 0 && minutes === 0) newErrors.time = 'Ingresa tiempo de impresión';
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'El peso debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleCalculate = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const hours = parseFloat(formData.hours) || 0;
      const minutes = parseFloat(formData.minutes) || 0;
      const totalMinutes = hours * 60 + minutes;
      const response = await api.post('/lots/calculate', {
        printer_id: formData.printer_id,
        material_id: formData.material_id,
        qty: parseInt(formData.pieces) || 1,
        minutos: totalMinutes,
        peso_g: parseFloat(formData.weight) || 0,
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error calculating:', error);
      alert('Error al calcular el costo');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    setSaving(true);
    try {
      const hours = parseFloat(formData.hours) || 0;
      const minutes = parseFloat(formData.minutes) || 0;
      await api.post('/lots/', {
        printer_id: formData.printer_id,
        material_id: formData.material_id,
        qty: parseInt(formData.pieces) || 1,
        minutos: hours * 60 + minutes,
        peso_g: parseFloat(formData.weight) || 0,
      });
      alert('Lote guardado exitosamente');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar el lote');
    } finally {
      setSaving(false);
    }
  }, [formData, result]);

  const handleClear = useCallback(() => {
    setFormData({ printer_id: '', material_id: '', pieces: '1', hours: '', minutes: '', weight: '' });
    setResult(null);
    setErrors({});
  }, []);

  // Memoized derived data
  const printerOptions = useMemo(() => printers.map(p => ({
    value: String(p.id),
    label: `${p.nombre} (${p.consumo_w}W)`,
  })), [printers]);

  const materialOptions = useMemo(() => materials.map(m => ({
    value: String(m.id),
    label: `${m.nombre} (${m.tipo} - ${formatCOP(m.cop_por_kg)}/kg)`,
  })), [materials, formatCOP]);

  const selectedPrinter = useMemo(() => printers.find(p => String(p.id) === formData.printer_id), [printers, formData.printer_id]);
  const selectedMaterial = useMemo(() => materials.find(m => String(m.id) === formData.material_id), [materials, formData.material_id]);

  const costItems = useMemo(() => result ? COST_ITEMS.map(item => ({
    ...item,
    value: result[item.key as keyof CalculationResult] as number,
  })) : [], [result]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            {ICON_CALCULATOR}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Calculadora de Costos</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Calcula el costo de producción y precio de venta sugerido</p>
          </div>
        </div>
        {result && (
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={ICON_SPREADSHEET}>
              Exportar Excel
            </Button>
            <Button variant="outline" leftIcon={ICON_REFRESH} onClick={handleClear}>
              Nueva cálculo
            </Button>
          </div>
        )}
      </div>

      {/* Form Card */}
      <Card className="space-y-6">
        <CardHeader
          title="Datos de Impresión"
          subtitle="Selecciona la configuración y parámetros de impresión"
          action={
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              {ICON_INFO}
              <span>Los costos se calculan según fórmulas validadas</span>
            </div>
          }
        />

        <CardContent className="space-y-6">
          {/* Impresora y Material */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Impresora"
              options={printerOptions}
              placeholder="Selecciona una impresora"
              name="printer_id"
              value={formData.printer_id}
              onChange={handleChange}
              error={errors.printer_id}
              helperText={selectedPrinter ? `Consumo: ${selectedPrinter.consumo_w}W • Vida: ${selectedPrinter.vida_util_horas}h` : undefined}
            />
            <Select
              label="Material"
              options={materialOptions}
              placeholder="Selecciona un material"
              name="material_id"
              value={formData.material_id}
              onChange={handleChange}
              error={errors.material_id}
              helperText={selectedMaterial ? `Merma: ${selectedMaterial.merma_pct}% • Tipo: ${selectedMaterial.tipo}` : undefined}
            />
          </div>

          {/* Cantidad, Horas, Minutos */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Cantidad de piezas"
              type="number"
              name="pieces"
              value={formData.pieces}
              onChange={handleChange}
              min={1}
              leftIcon={ICON_HASH}
            />
            <Input
              label="Horas de impresión"
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              min={0}
              max={999}
              helperText="Tiempo en horas"
              leftIcon={ICON_CLOCK}
            />
            <Input
              label="Minutos"
              type="number"
              name="minutes"
              value={formData.minutes}
              onChange={handleChange}
              min={0}
              max={59}
              helperText="Minutos (0-59)"
              leftIcon={ICON_TIMER}
            />
          </div>

          {/* Peso */}
          <Input
            label="Peso del filamento (gramos)"
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min={0.1}
            step={0.1}
            error={errors.weight}
            helperText="Peso total de filamento para la impresión"
            leftIcon={ICON_SCALE}
          />

          {/* Actions */}
          <CardFooter className="flex-wrap gap-3">
            <Button
              onClick={handleCalculate}
              disabled={loading}
              isLoading={loading}
              size="lg"
              leftIcon={ICON_CALCULATOR_SM}
              className="flex-1 sm:flex-initial"
            >
              Calcular Costos
            </Button>
            <Button variant="outline" size="lg" onClick={handleClear} leftIcon={ICON_REFRESH}>
              Limpiar
            </Button>
          </CardFooter>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Cost Breakdown */}
          <Card className="space-y-6">
            <CardHeader title="Desglose de Costos" subtitle="Costos en COP (pesos colombianos)" />

            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {costItems.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-lg p-4 border ${item.color === 'brand' ? 'border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10' : 'border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg" aria-hidden="true">{item.icon}</span>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{item.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums cop-amount">
                      {formatCOP(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Total & Suggested Price */}
            <CardFooter className="bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 rounded-xl p-4 border-t-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-brand-100 dark:border-brand-500/30">
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400 mb-1">COSTO TOTAL DE PRODUCCIÓN</p>
                  <p className="text-3xl font-bold text-brand-900 dark:text-brand-200 font-mono tabular-nums cop-amount">
                    {formatCOP(result.total_costo)}
                  </p>
                </div>
                <div className="p-4 bg-brand-600 rounded-lg text-white">
                  <p className="text-sm font-medium text-brand-100 mb-1">PRECIO VENTA SUGERIDO (100% margen)</p>
                  <p className="text-3xl font-bold font-mono tabular-nums cop-amount">
                    {formatCOP(result.precio_venta_sugerido)}
                  </p>
                </div>
              </div>
            </CardFooter>

            {/* Save Actions */}
            <CardFooter className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                isLoading={saving}
                size="lg"
                leftIcon={ICON_SAVE}
                className="flex-1 sm:flex-initial"
              >
                Guardar como Lote de Producción
              </Button>
              <Button variant="outline" size="lg" leftIcon={ICON_SPREADSHEET}>
                Exportar a Excel
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Summary */}
          <Card>
            <CardHeader title="Resumen Rápido" />
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-success-50 dark:bg-success-500/10">
                  <p className="text-3xl font-bold text-success-700 dark:text-success-400 font-mono tabular-nums">{formData.pieces}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Piezas</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10">
                  <p className="text-3xl font-bold text-brand-700 dark:text-brand-400 font-mono tabular-nums">{formData.hours}h {formData.minutes}m</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Tiempo total</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-info-50 dark:bg-info-500/10">
                  <p className="text-3xl font-bold text-info-700 dark:text-info-400 font-mono tabular-nums">{formData.weight}g</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Filamento</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning-50 dark:bg-warning-500/10">
                  <p className="text-3xl font-bold text-warning-700 dark:text-warning-400 font-mono tabular-nums cop-amount">
                    {formatCOP(Math.round(result.precio_venta_sugerido / (parseInt(formData.pieces) || 1)))}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Precio/unidad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            {ICON_CALCULATOR_LG}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Sin cálculos aún</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs mx-auto">
            Completa los datos de impresión y presiona "Calcular Costos" para ver el desglose completo.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 dark:text-neutral-500">
            {EMPTY_STATE_CHECKS.map((item, i) => (
              <React.Fragment key={i}>
                {item.icon}
                <span>{item.text}</span>
              </React.Fragment>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};