import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Printer } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface PrinterItem {
  id: number;
  nombre: string;
  consumo_w: number;
  precio_maquina: number;
  vida_util_horas: number;
  reparaciones_pct: number;
  activa: boolean;
}

interface PrinterFormData {
  nombre: string;
  consumo_w: string;
  precio_maquina: string;
  vida_util_horas: string;
  reparaciones_pct: string;
  activa: boolean;
}

const ICON_PRINTER = <Printer className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_PRINTER_LG = <Printer className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_PLUS_SM = <Plus className="h-3.5 w-3.5" />;
const ICON_EDIT = <Edit className="h-3.5 w-3.5" />;
const ICON_TRASH = <Trash2 className="h-3.5 w-3.5" />;
const ICON_SEARCH = <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_X = <X className="h-5 w-5" />;

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(value);

export const Printers = () => {
  const toast = useToast();
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PrinterItem | null>(null);
  const [formData, setFormData] = useState<PrinterFormData>({
    nombre: '', consumo_w: '', precio_maquina: '', vida_util_horas: '', reparaciones_pct: '0', activa: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const resp = await api.get('/printers/');
      setPrinters(resp.data);
    } catch (error) {
      console.error('Error fetching printers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => printers.filter(p =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  ), [printers, searchQuery]);

  const validateForm = useCallback(() => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = 'Nombre es requerido';
    if (!formData.consumo_w || parseFloat(formData.consumo_w) <= 0) e.consumo_w = 'Consumo inválido';
    if (!formData.precio_maquina || parseFloat(formData.precio_maquina) <= 0) e.precio_maquina = 'Precio inválido';
    if (!formData.vida_util_horas || parseFloat(formData.vida_util_horas) <= 0) e.vida_util_horas = 'Vida útil inválida';
    if (formData.reparaciones_pct === '' || parseFloat(formData.reparaciones_pct) < 0) e.reparaciones_pct = 'Valor inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      nombre: formData.nombre.trim(),
      consumo_w: parseFloat(formData.consumo_w),
      precio_maquina: Math.round(parseFloat(formData.precio_maquina)),
      vida_util_horas: parseFloat(formData.vida_util_horas),
      reparaciones_pct: parseFloat(formData.reparaciones_pct) || 0,
      activa: formData.activa,
    };
    try {
      if (editing) {
        await api.put(`/printers/${editing.id}`, payload);
        toast.success('Impresora actualizada exitosamente');
      } else {
        await api.post('/printers/', payload);
        toast.success('Impresora creada exitosamente');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving printer:', error);
      toast.error('Error al guardar la impresora');
    }
  }, [formData, editing, validateForm, fetchData, toast]);

  const handleEdit = useCallback((item: PrinterItem) => {
    setEditing(item);
    setFormData({
      nombre: item.nombre,
      consumo_w: String(item.consumo_w),
      precio_maquina: String(item.precio_maquina),
      vida_util_horas: String(item.vida_util_horas),
      reparaciones_pct: String(item.reparaciones_pct),
      activa: item.activa,
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta impresora?')) return;
    try {
      await api.delete(`/printers/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting printer:', error);
      toast.error('Error al eliminar la impresora');
    }
  }, [fetchData, toast]);

  const resetForm = useCallback(() => {
    setFormData({ nombre: '', consumo_w: '', precio_maquina: '', vida_util_horas: '', reparaciones_pct: '0', activa: true });
    setErrors({});
  }, []);

  const openNewModal = useCallback(() => { resetForm(); setEditing(null); setShowModal(true); }, [resetForm]);
  const handleModalClose = useCallback(() => { setShowModal(false); setEditing(null); resetForm(); }, [resetForm]);

  const columns = useMemo(() => [
    { key: 'id', header: 'ID', render: (item: PrinterItem) => <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">#{item.id}</span> },
    { key: 'nombre', header: 'Nombre', render: (item: PrinterItem) => <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.nombre}</span> },
    { key: 'consumo_w', header: 'Consumo', render: (item: PrinterItem) => <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.consumo_w}W</span> },
    { key: 'precio_maquina', header: 'Precio', render: (item: PrinterItem) => <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">{formatCOP(item.precio_maquina)}</span> },
    { key: 'vida_util_horas', header: 'Vida útil', render: (item: PrinterItem) => <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.vida_util_horas}h</span> },
    { key: 'reparaciones_pct', header: 'Reparaciones', render: (item: PrinterItem) => <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.reparaciones_pct}%</span> },
    { key: 'activa', header: 'Estado', render: (item: PrinterItem) => <Badge variant={item.activa ? 'success' : 'neutral'} size="sm">{item.activa ? 'Activa' : 'Inactiva'}</Badge> },
    { key: 'actions', header: '', render: (item: PrinterItem) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors" aria-label={`Editar ${item.nombre}`}>{ICON_EDIT}</button>
        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors" aria-label={`Eliminar ${item.nombre}`}>{ICON_TRASH}</button>
      </div>
    )},
  ], [handleEdit, handleDelete]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700">
          <SkeletonTable rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">{ICON_PRINTER}</div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Impresoras</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Gestiona tu equipo de impresión 3D</p>
          </div>
        </div>
        <Button onClick={openNewModal} size="lg" leftIcon={ICON_PLUS}>Nueva Impresora</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">{ICON_SEARCH}</div>
          <Input placeholder="Buscar por nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" leftIcon={null} />
        </div>
      </Card>

      <Card>
        <CardHeader title={`Impresoras (${filtered.length}/${printers.length})`} subtitle="Lista de impresoras registradas" />
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-6">
              {ICON_PRINTER_LG}
              <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-4">{printers.length === 0 ? 'No hay impresoras registradas' : 'No se encontraron impresoras'}</p>
              {printers.length === 0 && <Button onClick={openNewModal} leftIcon={ICON_PLUS_SM}>Crear primera impresora</Button>}
            </div>
          ) : (
            <Table columns={columns} data={filtered} keyExtractor={(p) => p.id} hoverable striped />
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleModalClose}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title={editing ? 'Editar Impresora' : 'Nueva Impresora'}
              subtitle={editing ? `ID: #${editing.id}` : 'Completa la información de la impresora'}
              action={<Button variant="ghost" size="sm" onClick={handleModalClose} aria-label="Cerrar">{ICON_X}</Button>}
            />
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej: Bambu Lab X1C" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Consumo (W)" type="number" name="consumo_w" value={formData.consumo_w} onChange={handleChange} error={errors.consumo_w} placeholder="Ej: 350" min={1} />
                  <Input label="Precio máquina (COP)" type="number" name="precio_maquina" value={formData.precio_maquina} onChange={handleChange} error={errors.precio_maquina} placeholder="Ej: 5000000" min={1} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Vida útil (horas)" type="number" name="vida_util_horas" value={formData.vida_util_horas} onChange={handleChange} error={errors.vida_util_horas} placeholder="Ej: 10000" min={1} />
                  <Input label="Reparaciones (%)" type="number" name="reparaciones_pct" value={formData.reparaciones_pct} onChange={handleChange} error={errors.reparaciones_pct} placeholder="Ej: 10" min={0} step={0.1} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="activa" checked={formData.activa} onChange={(e) => setFormData(prev => ({ ...prev, activa: e.target.checked }))} className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 focus:ring-brand-500" />
                  <label htmlFor="activa" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activa</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={handleModalClose}>Cancelar</Button>
                  <Button type="submit">{editing ? 'Actualizar' : 'Crear'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
