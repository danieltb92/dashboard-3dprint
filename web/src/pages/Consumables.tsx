import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Droplets, Save } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface ConsumableItem {
  id: number;
  nombre: string;
  costo_unitario: number;
  unidad: string;
  uso_por_cm2: number;
  activo: boolean;
}

interface ConsumableFormData {
  nombre: string;
  costo_unitario: string;
  unidad: string;
  uso_por_cm2: string;
  activo: boolean;
}

const ICON_DROPLETS = <Droplets className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_PLUS_SM = <Plus className="h-3.5 w-3.5" />;
const ICON_EDIT = <Edit className="h-3.5 w-3.5" />;
const ICON_TRASH = <Trash2 className="h-3.5 w-3.5" />;
const ICON_SEARCH = <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_X = <X className="h-5 w-5" />;

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(value);

const UNIDADES = ['ml', 'litro', 'unidad', 'par', 'kg'];

export const Consumables = () => {
  const toast = useToast();
  const [consumables, setConsumables] = useState<ConsumableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ConsumableItem | null>(null);
  const [formData, setFormData] = useState<ConsumableFormData>({
    nombre: '', costo_unitario: '', unidad: 'ml', uso_por_cm2: '0', activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const resp = await api.get('/consumables/');
      setConsumables(resp.data);
    } catch (error) {
      console.error('Error fetching consumables:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => consumables.filter(c =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.unidad.toLowerCase().includes(searchQuery.toLowerCase())
  ), [consumables, searchQuery]);

  const validateForm = useCallback(() => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = 'Nombre es requerido';
    if (!formData.costo_unitario || parseFloat(formData.costo_unitario) <= 0) e.costo_unitario = 'Costo inválido';
    if (!formData.unidad.trim()) e.unidad = 'Unidad es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      nombre: formData.nombre.trim(),
      costo_unitario: Math.round(parseFloat(formData.costo_unitario)),
      unidad: formData.unidad.trim(),
      uso_por_cm2: parseFloat(formData.uso_por_cm2) || 0,
      activo: formData.activo,
    };
    try {
      if (editing) {
        await api.put(`/consumables/${editing.id}`, payload);
        toast.success('Consumible actualizado');
      } else {
        await api.post('/consumables', payload);
        toast.success('Consumible creado');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving consumable:', error);
      toast.error('Error al guardar el consumible');
    }
  }, [formData, editing, validateForm, fetchData, toast]);

  const handleEdit = useCallback((item: ConsumableItem) => {
    setEditing(item);
    setFormData({
      nombre: item.nombre,
      costo_unitario: String(item.costo_unitario),
      unidad: item.unidad,
      uso_por_cm2: String(item.uso_por_cm2),
      activo: item.activo,
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Eliminar este consumible?')) return;
    try {
      await api.delete(`/consumables/${id}`);
      toast.success('Consumible eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  }, [fetchData, toast]);

  const resetForm = () => {
    setFormData({ nombre: '', costo_unitario: '', unidad: 'ml', uso_por_cm2: '0', activo: true });
    setErrors({});
  };

  const openNewModal = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const columns = [
    { key: 'nombre', header: 'Nombre', render: (item: ConsumableItem) => <span className="font-medium">{item.nombre}</span> },
    { key: 'costo_unitario', header: 'Costo', render: (item: ConsumableItem) => <span className="font-mono text-sm">{formatCOP(item.costo_unitario)}</span> },
    { key: 'unidad', header: 'Unidad', render: (item: ConsumableItem) => <Badge variant="neutral">{item.unidad}</Badge> },
    { key: 'uso_por_cm2', header: 'Uso/cm²', render: (item: ConsumableItem) => <span className="font-mono text-sm">{item.uso_por_cm2}</span> },
    { key: 'activo', header: 'Estado', render: (item: ConsumableItem) => <Badge variant={item.activo ? 'success' : 'neutral'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (item: ConsumableItem) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} leftIcon={ICON_EDIT}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} leftIcon={ICON_TRASH} className="text-danger-600 hover:text-danger-700">Eliminar</Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2"><Skeleton className="h-7 w-32" /><Skeleton className="h-4 w-48" /></div>
        </div>
        <Skeleton className="h-10 w-64 rounded-lg" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {ICON_DROPLETS}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Consumibles</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Pinturas, primers y otros materiales de postproducción</p>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`Consumibles (${filtered.length}/${consumables.length})`}
          subtitle="Materiales para acabados y postproducción"
          action={<Button onClick={openNewModal} leftIcon={ICON_PLUS}>Nuevo Consumible</Button>}
        />
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
            <Input
              placeholder="Buscar por nombre o unidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={ICON_SEARCH}
              rightIcon={searchQuery ? <button onClick={() => setSearchQuery('')}><X className="h-5 w-5" /></button> : undefined}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {consumables.length === 0 ? 'Sin consumibles aún' : 'Sin resultados'}
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 max-w-xs mx-auto">
                {consumables.length === 0
                  ? 'Registra pinturas, primers y otros materiales de acabado.'
                  : 'No se encontraron consumibles con los filtros aplicados.'}
              </p>
              {consumables.length === 0 && (
                <Button onClick={openNewModal} leftIcon={ICON_PLUS_SM}>Crear primer consumible</Button>
              )}
            </div>
          ) : (
            <Table columns={columns} data={filtered} keyExtractor={(c) => c.id} hoverable striped />
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              title={editing ? 'Editar Consumible' : 'Nuevo Consumible'}
              action={<Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="h-5 w-5" /></Button>}
            />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej: Pintura Acrílica" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Costo unitario (COP)" type="number" name="costo_unitario" value={formData.costo_unitario} onChange={handleChange} error={errors.costo_unitario} placeholder="Ej: 15000" min={1} />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Unidad</label>
                    <select name="unidad" value={formData.unidad} onChange={handleChange} className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800">
                      {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <Input label="Uso por cm²" type="number" name="uso_por_cm2" value={formData.uso_por_cm2} onChange={handleChange} placeholder="0.02" step="0.01" min="0" />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{editing ? 'Actualizar' : 'Crear'}</Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
