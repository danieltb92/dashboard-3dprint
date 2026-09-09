import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Users, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, createColumns } from '../components/ui/Table';
import api from '../services/api';

interface Client {
  id: number;
  nombre: string;
  contacto: string;
  notas: string | null;
}

interface ClientFormData {
  nombre: string;
  contacto: string;
  notas: string;
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
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    nombre: '',
    contacto: '',
    notas: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

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
    return client.nombre.toLowerCase().includes(query) ||
      client.contacto.toLowerCase().includes(query);
  }), [clients, searchQuery]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.contacto.trim()) newErrors.contacto = 'Contacto es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, payload);
        alert('Cliente actualizado exitosamente');
      } else {
        await api.post('/clients/', payload);
        alert('Cliente creado exitosamente');
      }

      setShowModal(false);
      setEditingClient(null);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente');
    }
  }, [formData, editingClient, validateForm, fetchClients]);

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setFormData({
      nombre: client.nombre,
      contacto: client.contacto,
      notas: client.notas || '',
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
      alert('Error al eliminar el cliente');
    }
  }, [fetchClients]);

  const resetForm = useCallback(() => {
    setFormData({ nombre: '', contacto: '', notas: '' });
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
      key: 'id',
      header: 'ID',
      render: (client) => (
        <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">#{client.id}</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
              {client.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{client.nombre}</span>
        </div>
      ),
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (client) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{client.contacto}</span>
      ),
    },
    {
      key: 'notas',
      header: 'Notas',
      render: (client) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] block">
          {client.notas || '—'}
        </span>
      ),
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden="true" />
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

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {ICON_SEARCH}
          </div>
          <Input
            placeholder="Buscar por nombre o contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            leftIcon={null}
          />
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
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                  placeholder="Ej: Juan Pérez"
                />

                <Input
                  label="Contacto"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  error={errors.contacto}
                  placeholder="Ej: juan@empresa.com"
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Notas sobre el cliente..."
                    rows={3}
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
                    isLoading={loading}
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
