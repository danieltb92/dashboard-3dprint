import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Save, Zap, Percent, DollarSign, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface Setting {
  key: string;
  value: string;
}

const SETTING_DEFINITIONS = [
  { key: 'cop_kwh', label: 'Costo por kWh (COP)', icon: Zap, description: 'Tarifa de energía eléctrica en pesos colombianos', type: 'number', section: 'costos' },
  { key: 'iva_pct', label: 'IVA (%)', icon: Percent, description: 'Porcentaje de IVA para cotizaciones', type: 'number', section: 'costos' },
  { key: 'labor_rate_cop', label: 'Tarifa mano de obra (COP/hora)', icon: DollarSign, description: 'Costo por hora de trabajo', type: 'number', section: 'costos' },
  { key: 'margen_default', label: 'Margen por defecto (%)', icon: TrendingUp, description: 'Margen de ganancia aplicado al precio de venta', type: 'number', section: 'costos' },
  { key: 'dias_retorno_inversion', label: 'Retorno de inversión (días)', icon: TrendingUp, description: 'Días estimados para recuperar la inversión de la impresora', type: 'number', section: 'inversion' },
  { key: 'usos_comerciales_dia', label: 'Usos comerciales por día', icon: BarChart3, description: 'Número promedio de usos comerciales diarios de la impresora', type: 'number', section: 'inversion' },
  { key: 'horas_operacion_dia', label: 'Horas de operación por día', icon: Clock, description: 'Horas diarias de uso de la impresora', type: 'number', section: 'inversion' },
];

const SECTION_LABELS: Record<string, { title: string; description: string }> = {
  costos: { title: 'Parámetros de Costos', description: 'Valores base para el cálculo de costos de producción' },
  inversion: { title: 'Inversión y Operación', description: 'Parámetros para análisis de retorno de inversión' },
};

const ICON_SETTINGS = <SettingsIcon className="h-6 w-6 text-brand-600" />;

export const Settings = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get<Setting[]>('/settings');
      const map: Record<string, string> = {};
      response.data.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = useCallback((key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) =>
          api.put(`/settings/${key}`, { value })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            {ICON_SETTINGS}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Configuración</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Ajusta los parámetros del sistema de costos</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="h-4 w-4" />}
          variant={saved ? 'secondary' : 'primary'}
        >
          {saved ? 'Guardado' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Settings Cards */}
      {Object.entries(SECTION_LABELS).map(([sectionKey, section]) => (
        <div key={sectionKey} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{section.title}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{section.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SETTING_DEFINITIONS.filter(s => s.section === sectionKey).map(({ key, label, icon: Icon, description, type }) => (
              <Card key={key} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3">{description}</p>
                    <Input
                      type={type}
                      value={settings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={label}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Info */}
      <Card className="p-4 bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30">
        <p className="text-sm text-brand-800 dark:text-brand-200">
          <strong>Nota:</strong> Estos valores se utilizan en el cálculo de costos de producción y en las cotizaciones.
          Los cambios se aplican inmediatamente a nuevos cálculos.
        </p>
      </Card>
    </div>
  );
};
