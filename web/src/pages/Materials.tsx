import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Package } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface MaterialItem {
  id: number;
  nombre: string;
  tipo: string;
  cop_por_kg: number;
  merma_pct: number;
  activa: boolean;
}

interface MaterialFormData {
  nombre: string;
  tipo: string;
  cop_por_kg: string;
  merma_pct: string;
  activa: boolean;
}

const ICON_PACKAGE = <Package className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_PACKAGE_LG = <Package className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_PLUS_SM = <Plus className="h-3.5 w-3.5" />;
const ICON_EDIT = <Edit className="h-3.5 w-3.5" />;
const ICON_TRASH = <Trash2 className="h-3.5 w-3.5" />;
const ICON_SEARCH = <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_X = <X className="h-5 w-5" />;

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(value);

export const Materials = () => {
  const toast = useToast();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MaterialItem | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({
    nombre: '', tipo: '', cop_por_kg: '', merma_pct: '20', activa: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const resp = await api.get('/materials/');
      setMaterials(resp.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => materials.filter(m =>
    m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tipo.toLowerCase().includes(searchQuery.toLowerCase())
  ), [materials, searchQuery]);

  const validateForm = useCallback(() => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = 'Nombre es requerido';
    if (!formData.tipo.trim()) e.tipo = 'Tipo es requerido';
    if (!formData.cop_por_kg || parseFloat(formData.cop_por_kg) <= 0) e.cop_por_kg = 'Precio inválido';
    if (formData.merma_pct === '' || parseFloat(formData.merma_pct) < 0) e.merma_pct = 'Valor inválido';
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
      tipo: formData.tipo.trim(),
      cop_por_kg: Math.round(parseFloat(formData.cop_por_kg)),
      merma_pct: parseFloat(formData.merma_pct) || 0,
      activa: formData.activa,
    };
    try {
      if (editing) {
        await api.put(`/materials/${editing.id}`, payload);
        toast.success('Material actualizado exitosamente');
      } else {
        await api.post('/materials/', payload);
        toast.success('Material creado exitosamente');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Error al guardar el material');
    }
  }, [formData, editing, validateForm, fetchData, toast]);

  const handleEdit = useCallback((item: MaterialItem) => {
    setEditing(item);
    setFormData({
      nombre: item.nombre,
      tipo: item.tipo,
      cop_por_kg: String(item.cop_por_kg),
      merma_pct: String(item.merma_pct),
      activa: item.activa,
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Error al eliminar el material');
    }
  }, [fetchData, toast]);

  const resetForm = useCallback(() => {
    setFormData({ nombre: '', tipo: '', cop_por_kg: '', merma_pct: '20', activa: true });
    setErrors({});
  }, []);

  const openNewModal = useCallback(() => { resetForm(); setEditing(null); setShowModal(true); }, [resetForm]);
  const handleModalClose = useCallback(() => { setShowModal(false); setEditing(null); resetForm(); }, [resetForm]);

  const columns = useMemo(() => [
    { key: 'id', header: 'ID', render: (item: MaterialItem) => <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">#{item.id}</span> },
    { key: 'nombre', header: 'Nombre', render: (item: MaterialItem) => <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.nombre}</span> },
    { key: 'tipo', header: 'Tipo', render: (item: MaterialItem) => <Badge variant="info" size="sm">{item.tipo}</Badge> },
    { key: 'cop_por_kg', header: 'Precio/kg', render: (item: MaterialItem) => <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">{formatCOP(item.cop_por_kg)}</span> },
    { key: 'merma_pct', header: 'Merma', render: (item: MaterialItem) => <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.merma_pct}%</span> },
    { key: 'activa', header: 'Estado', render: (item: MaterialItem) => <Badge variant={item.activa ? 'success' : 'neutral'} size="sm">{item.activa ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'actions', header: '', render: (item: MaterialItem) => (
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
          <Skeleton className="h-10 w-32 rounded-lg" />
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
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">{ICON_PACKAGE}</div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Materiales</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Gestiona tus filamentos y materiales de impresión</p>
          </div>
        </div>
        <Button onClick={openNewModal} size="lg" leftIcon={ICON_PLUS}>Nuevo Material</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">{ICON_SEARCH}</div>
          <Input placeholder="Buscar por nombre o tipo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" leftIcon={null} />
        </div>
      </Card>

      <Card>
        <CardHeader title={`Materiales (${filtered.length}/${materials.length})`} subtitle="Lista de materiales registrados" />
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-6">
              {ICON_PACKAGE_LG}
              <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-4">{materials.length === 0 ? 'No hay materiales registrados' : 'No se encontraron materiales'}</p>
              {materials.length === 0 && <Button onClick={openNewModal} leftIcon={ICON_PLUS_SM}>Crear primer material</Button>}
            </div>
          ) : (
            <Table columns={columns} data={filtered} keyExtractor={(m) => m.id} hoverable striped />
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleModalClose}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title={editing ? 'Editar Material' : 'Nuevo Material'}
              subtitle={editing ? `ID: #${editing.id}` : 'Completa la información del material'}
              action={<Button variant="ghost" size="sm" onClick={handleModalClose} aria-label="Cerrar">{ICON_X}</Button>}
            />
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej: PLA Premium" />
                <Input label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} error={errors.tipo} placeholder="Ej: PLA, PETG, ABS, TPU" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Precio por kg (COP)" type="number" name="cop_por_kg" value={formData.cop_por_kg} onChange={handleChange} error={errors.cop_por_kg} placeholder="Ej: 80000" min={1} />
                  <Input label="Merma (%)" type="number" name="merma_pct" value={formData.merma_pct} onChange={handleChange} error={errors.merma_pct} placeholder="Ej: 20" min={0} step={0.1} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="activa" checked={formData.activa} onChange={(e) => setFormData(prev => ({ ...prev, activa: e.target.checked }))} className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 focus:ring-brand-500" />
                  <label htmlFor="activa" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activo</label>
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
