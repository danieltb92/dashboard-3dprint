import { useState, useEffect, useCallback } from 'react';
import { Building2, Save, MapPin, Phone, Mail, Globe, FileText } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import api from '../services/api';
import { toast } from "sonner";

interface CompanyData {
  id?: number;
  nombre: string;
  logo_url: string;
  direccion: string;
  telefono: string;
  email: string;
  nit: string;
  website: string;
}

const ICON_BUILDING = <Building2 className="h-6 w-6 text-brand-600" />;

export const Company = () => {
  
  const [company, setCompany] = useState<CompanyData>({
    nombre: '',
    logo_url: '',
    direccion: '',
    telefono: '',
    email: '',
    nit: '',
    website: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const fetchCompany = useCallback(async () => {
    try {
      const response = await api.get<CompanyData[]>('/company');
      if (response.data.length > 0) {
        const data = response.data[0];
        setCompany(data);
        setCompanyId(data.id || null);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleChange = useCallback((field: keyof CompanyData, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!company.nombre.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }
    setSaving(true);
    try {
      if (companyId) {
        await api.put(`/company/${companyId}`, company);
      } else {
        const response = await api.post('/company', company);
        setCompanyId(response.data.id);
      }
      toast.success('Empresa guardada correctamente');
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Error al guardar la empresa');
    } finally {
      setSaving(false);
    }
  }, [company, companyId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {ICON_BUILDING}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Empresa</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Datos de tu empresa para cotizaciones</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Información de la Empresa" subtitle="Datos que aparecerán en las cotizaciones" />
        <CardContent className="space-y-4">
          <Input
            label="Nombre de la empresa"
            value={company.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: DCapital.co"
            required
          />
          <Input
            label="NIT / RUT"
            value={company.nit}
            onChange={(e) => handleChange('nit', e.target.value)}
            placeholder="Ej: 900.123.456-7"
            leftIcon={<FileText className="h-4 w-4" />}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Dirección"
              value={company.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Ej: Calle 123 #45-67"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
            <Input
              label="Teléfono"
              value={company.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Ej: +57 300 123 4567"
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={company.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ej: info@dcapital.co"
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Website"
              value={company.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="Ej: https://dcapital.co"
              leftIcon={<Globe className="h-4 w-4" />}
            />
          </div>
          <Input
            label="URL del Logo"
            value={company.logo_url}
            onChange={(e) => handleChange('logo_url', e.target.value)}
            placeholder="Ej: https://dcapital.co/logo.png"
          />
        </CardContent>
        <div className="px-6 pb-6">
          <Button onClick={handleSave} disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
            {saving ? 'Guardando...' : 'Guardar Empresa'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
