import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Users, Mail, Phone, MapPin, Building2, Filter } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, createColumns } from '../components/ui/Table';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface Client {
  id: number;
  codigo: string;
  nombre: string;
  contacto: string;
  notas: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  departamento: string | null;
  empresa: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  condicion_pago: string | null;
}

interface ClientFormData {
  nombre: string;
  contacto: string;
  notas: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  empresa: string;
  tipo_documento: string;
  numero_documento: string;
  condicion_pago: string;
}

// Icon constants
const ICON_USERS = <Users className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_USERS_LG = <Users className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_PLUS_SM = <Plus className="h-3.5 w-3.5" />;
const ICON_EDIT = <Edit className="h-3.5 w-3.5" />;
const ICON_TRASH = <Trash2 className="h-3.5 w-3.5" />;
const ICON_SEARCH = <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_X = <X className="h-5 w-5" />;

export const Clientes = () => {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    nombre: '',
    contacto: '',
    notas: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    empresa: '',
    tipo_documento: '',
    numero_documento: '',
    condicion_pago: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState('');
  const [pagoFilter, setPagoFilter] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/clients/');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => clients.filter(client => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = client.nombre.toLowerCase().includes(query) ||
      client.contacto.toLowerCase().includes(query) ||
      (client.empresa && client.empresa.toLowerCase().includes(query)) ||
      (client.ciudad && client.ciudad.toLowerCase().includes(query)) ||
      (client.codigo && client.codigo.toLowerCase().includes(query));
    const matchesDepto = !departamentoFilter || client.departamento === departamentoFilter;
    const matchesPago = !pagoFilter || client.condicion_pago === pagoFilter;
    return matchesSearch && matchesDepto && matchesPago;
  }), [clients, searchQuery, departamentoFilter, pagoFilter]);

  const departamentos = useMemo(() => {
    const vals = new Set(clients.map(c => c.departamento).filter((v): v is string => Boolean(v)));
    return [...vals].sort();
  }, [clients]);

  const pagoOptions = useMemo(() => {
    const map: Record<string, string> = { contado: 'Contado', '15_dias': '15 días', '30_dias': '30 días', '45_dias': '45 días', '60_dias': '60 días' };
    const vals = new Set(clients.map(c => c.condicion_pago).filter((v): v is string => Boolean(v)));
    return [...vals].map(v => ({ value: v, label: map[v] || v }));
  }, [clients]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setDepartamentoFilter('');
    setPagoFilter('');
  }, []);

  const hasFilters = searchQuery || departamentoFilter || pagoFilter;

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.contacto.trim()) newErrors.contacto = 'Contacto es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        contacto: formData.contacto.trim(),
        notas: formData.notas.trim() || null,
        telefono: formData.telefono.trim() || null,
        direccion: formData.direccion.trim() || null,
        ciudad: formData.ciudad.trim() || null,
        departamento: formData.departamento.trim() || null,
        empresa: formData.empresa.trim() || null,
        tipo_documento: formData.tipo_documento || null,
        numero_documento: formData.numero_documento.trim() || null,
        condicion_pago: formData.condicion_pago || null,
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, payload);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await api.post('/clients/', payload);
        toast.success('Cliente creado exitosamente');
      }

      setShowModal(false);
      setEditingClient(null);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Error al guardar el cliente');
    }
  }, [formData, editingClient, validateForm, fetchClients]);

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setFormData({
      nombre: client.nombre,
      contacto: client.contacto,
      notas: client.notas || '',
      telefono: client.telefono || '',
      direccion: client.direccion || '',
      ciudad: client.ciudad || '',
      departamento: client.departamento || '',
      empresa: client.empresa || '',
      tipo_documento: client.tipo_documento || '',
      numero_documento: client.numero_documento || '',
      condicion_pago: client.condicion_pago || '',
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error al eliminar el cliente');
    }
  }, [fetchClients]);

  const resetForm = useCallback(() => {
    setFormData({ nombre: '', contacto: '', notas: '', telefono: '', direccion: '', ciudad: '', departamento: '', empresa: '', tipo_documento: '', numero_documento: '', condicion_pago: '' });
    setErrors({});
  }, []);

  const openNewModal = useCallback(() => {
    setEditingClient(null);
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingClient(null);
    resetForm();
  }, [resetForm]);

  const columns = useMemo(() => createColumns<Client>([
    {
      key: 'codigo',
      header: 'Código',
      render: (client) => (
        <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">{client.codigo}</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (client) => (
        <div>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{client.nombre}</span>
          {client.empresa && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" />{client.empresa}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (client) => (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.contacto}</p>
          {client.telefono && (
            <p className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{client.telefono}</p>
          )}
        </div>
      ),
    },
    {
      key: 'ciudad',
      header: 'Ubicación',
      render: (client) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {client.ciudad || '—'}{client.departamento ? `, ${client.departamento}` : ''}
        </span>
      ),
    },
    {
      key: 'condicion_pago',
      header: 'Pago',
      render: (client) => {
        const labels: Record<string, string> = {
          contado: 'Contado',
          '15_dias': '15 días',
          '30_dias': '30 días',
          '45_dias': '45 días',
          '60_dias': '60 días',
        };
        return client.condicion_pago ? (
          <Badge variant="info" size="sm">{labels[client.condicion_pago] || client.condicion_pago}</Badge>
        ) : <span className="text-neutral-400">—</span>;
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right' as const,
      render: (client) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={ICON_EDIT}
            onClick={() => handleEdit(client)}
            aria-label={`Editar ${client.nombre}`}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={ICON_TRASH}
            onClick={() => handleDelete(client.id)}
            aria-label={`Eliminar ${client.nombre}`}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]), [handleEdit, handleDelete]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700">
          <SkeletonTable rows={5} />
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
            {ICON_USERS}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Clientes</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Gestiona tu cartera de clientes</p>
          </div>
        </div>
        <Button onClick={openNewModal} size="lg" leftIcon={ICON_PLUS}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
                {ICON_SEARCH}
              </div>
              <Input
                placeholder="Buscar por nombre, código, empresa, ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                leftIcon={null}
              />
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<X className="h-3.5 w-3.5" />}
                className="text-neutral-500 dark:text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Departamento pills */}
          {departamentos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Departamento:</span>
              <button
                onClick={() => setDepartamentoFilter('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !departamentoFilter
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-500/40'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Todos
              </button>
              {departamentos.map((depto) => (
                <button
                  key={depto}
                  onClick={() => setDepartamentoFilter(departamentoFilter === depto ? '' : depto)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    departamentoFilter === depto
                      ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-500/40'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {depto}
                </button>
              ))}
            </div>
          )}

          {/* Condición de pago pills */}
          {pagoOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Pago:</span>
              <button
                onClick={() => setPagoFilter('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !pagoFilter
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-500/40'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Todos
              </button>
              {pagoOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPagoFilter(pagoFilter === opt.value ? '' : opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    pagoFilter === opt.value
                      ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-500/40'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader
          title={`Clientes (${filteredClients.length}/${clients.length})`}
          subtitle="Lista de clientes registrados"
        />
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 px-6">
              {ICON_USERS_LG}
              <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-4">
                {clients.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}
              </p>
              {clients.length === 0 && (
                <Button onClick={openNewModal} leftIcon={ICON_PLUS_SM}>
                  Crear primer cliente
                </Button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredClients}
              keyExtractor={(c) => c.id}
              hoverable
              striped
            />
          )}
        </CardContent>
      </Card>

      {/* New/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { e.stopPropagation(); handleModalClose(); }}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              subtitle={editingClient ? `ID: #${editingClient.id}` : 'Completa la información del cliente'}
              action={
                <Button variant="ghost" size="sm" onClick={handleModalClose} aria-label="Cerrar">
                  {ICON_X}
                </Button>
              }
            />
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Personales */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Datos Personales</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre completo"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      error={errors.nombre}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                    <Input
                      label="Empresa / Razón social"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Ej: Impresos3D S.A.S."
                      leftIcon={<Building2 className="h-4 w-4 text-neutral-400" />}
                    />
                  </div>
                </div>

                {/* Documento */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Identificación</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Tipo de documento"
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'Seleccionar...' },
                        { value: 'NIT', label: 'NIT' },
                        { value: 'CC', label: 'Cédula de Ciudadanía' },
                        { value: 'CE', label: 'Cédula de Extranjería' },
                        { value: 'RUT', label: 'RUT' },
                        { value: 'pasaporte', label: 'Pasaporte' },
                      ]}
                    />
                    <Input
                      label="Número de documento"
                      name="numero_documento"
                      value={formData.numero_documento}
                      onChange={handleChange}
                      placeholder="Ej: 900.123.456-7"
                    />
                  </div>
                </div>

                {/* Contacto */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Contacto</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Email"
                      name="contacto"
                      type="email"
                      value={formData.contacto}
                      onChange={handleChange}
                      error={errors.contacto}
                      required
                      placeholder="juan@empresa.com"
                      leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
                    />
                    <Input
                      label="Teléfono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="300 123 4567"
                      leftIcon={<Phone className="h-4 w-4 text-neutral-400" />}
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Ubicación</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ej: Bogotá D.C."
                      leftIcon={<MapPin className="h-4 w-4 text-neutral-400" />}
                    />
                    <Input
                      label="Departamento"
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      placeholder="Ej: Cundinamarca"
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Dirección"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                </div>

                {/* Condiciones Comerciales */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Condiciones Comerciales</h3>
                  <Select
                    label="Condición de pago"
                    name="condicion_pago"
                    value={formData.condicion_pago}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Seleccionar...' },
                      { value: 'contado', label: 'Contado' },
                      { value: '15_dias', label: 'Crédito 15 días' },
                      { value: '30_dias', label: 'Crédito 30 días' },
                      { value: '45_dias', label: 'Crédito 45 días' },
                      { value: '60_dias', label: 'Crédito 60 días' },
                    ]}
                  />
                </div>

                {/* Notas */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Notas</h3>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Preferencias, historial, referencias..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors duration-150 resize-none"
                  />
                </div>

                <CardFooter className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    {editingClient ? 'Actualizar' : 'Crear Cliente'}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
