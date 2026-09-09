import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, X, ShoppingCart, Loader2, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, createColumns } from '../components/ui/Table';
import api from '../services/api';

interface Sale {
  id: number;
  product_id: number;
  client_id: number;
  quote_id: number | null;
  qty: number;
  precio_unitario_cop: number;
  fecha: string;
}

interface Product {
  id: number;
  sku: string;
  nombre: string;
  precio_venta_cop: number;
}

interface Client {
  id: number;
  nombre: string;
  contacto: string;
}

interface SaleFormData {
  product_id: string;
  client_id: string;
  qty: string;
  precio_unitario_cop: string;
}

// Icon constants
const ICON_CART = <ShoppingCart className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_CART_LG = <ShoppingCart className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_SEARCH = <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_X = <X className="h-5 w-5" />;
const ICON_DOLLAR = <DollarSign className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;

export const Pedidos = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>({
    product_id: '',
    client_id: '',
    qty: '1',
    precio_unitario_cop: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [salesResp, productsResp, clientsResp] = await Promise.all([
        api.get('/sales/'),
        api.get('/products/?activa=true'),
        api.get('/clients/'),
      ]);
      setSales(salesResp.data);
      setProducts(productsResp.data);
      setClients(clientsResp.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCOP = useCallback((value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Build lookup maps
  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach(p => map.set(p.id, p));
    return map;
  }, [products]);

  const clientMap = useMemo(() => {
    const map = new Map<number, Client>();
    clients.forEach(c => map.set(c.id, c));
    return map;
  }, [clients]);

  const filteredSales = useMemo(() => sales.filter(sale => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const product = productMap.get(sale.product_id);
    const client = clientMap.get(sale.client_id);
    return (
      (product?.nombre.toLowerCase().includes(query)) ||
      (client?.nombre.toLowerCase().includes(query)) ||
      (client?.contacto.toLowerCase().includes(query))
    );
  }), [sales, searchQuery, productMap, clientMap]);

  // Summary stats
  const summary = useMemo(() => {
    const totalVentas = sales.reduce((sum, sale) => sum + (sale.precio_unitario_cop * sale.qty), 0);
    return {
      totalVentas,
      cantidadPedidos: sales.length,
    };
  }, [sales]);

  const productOptions = useMemo(() =>
    products.map(p => ({ value: String(p.id), label: `${p.sku} - ${p.nombre}` })),
    [products]
  );

  const clientOptions = useMemo(() =>
    clients.map(c => ({ value: String(c.id), label: c.nombre })),
    [clients]
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.product_id) newErrors.product_id = 'Selecciona un producto';
    if (!formData.client_id) newErrors.client_id = 'Selecciona un cliente';
    if (!formData.qty || parseInt(formData.qty) <= 0) newErrors.qty = 'Cantidad debe ser mayor a 0';
    if (!formData.precio_unitario_cop || parseFloat(formData.precio_unitario_cop) <= 0) {
      newErrors.precio_unitario_cop = 'Precio debe ser mayor a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-fill price from product
      if (name === 'product_id' && value) {
        const product = products.find(p => p.id === parseInt(value));
        if (product) {
          updated.precio_unitario_cop = String(product.precio_venta_cop);
        }
      }
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors, products]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await api.post('/sales/', {
        product_id: parseInt(formData.product_id),
        client_id: parseInt(formData.client_id),
        qty: parseInt(formData.qty),
        precio_unitario_cop: parseInt(formData.precio_unitario_cop),
      });

      alert('Pedido creado exitosamente');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al crear el pedido');
    }
  }, [formData, validateForm, fetchData]);

  const resetForm = useCallback(() => {
    setFormData({ product_id: '', client_id: '', qty: '1', precio_unitario_cop: '' });
    setErrors({});
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const columns = useMemo(() => createColumns<Sale>([
    {
      key: 'id',
      header: 'ID',
      render: (sale) => (
        <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">#{sale.id}</span>
      ),
    },
    {
      key: 'quote',
      header: 'Cotización',
      render: (sale) => (
        sale.quote_id ? (
          <Badge variant="info" size="sm">#{sale.quote_id}</Badge>
        ) : (
          <span className="text-neutral-400 dark:text-neutral-500 text-sm">—</span>
        )
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (sale) => {
        const client = clientMap.get(sale.client_id);
        return (
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{client?.nombre || 'N/A'}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{client?.contacto || ''}</p>
          </div>
        );
      },
    },
    {
      key: 'product',
      header: 'Producto',
      render: (sale) => {
        const product = productMap.get(sale.product_id);
        return (
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{product?.nombre || 'N/A'}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{product?.sku || ''}</p>
          </div>
        );
      },
    },
    {
      key: 'qty',
      header: 'Cantidad',
      align: 'center' as const,
      render: (sale) => (
        <Badge variant="info" size="sm">{sale.qty}</Badge>
      ),
    },
    {
      key: 'precio_unitario_cop',
      header: 'P. Unitario',
      align: 'right' as const,
      render: (sale) => (
        <span className="font-mono text-neutral-600 dark:text-neutral-400">{formatCOP(sale.precio_unitario_cop)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (sale) => (
        <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{formatCOP(sale.precio_unitario_cop * sale.qty)}</span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (sale) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {new Date(sale.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ]), [clientMap, productMap, formatCOP]);

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
            {ICON_CART}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Pedidos</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Registro de ventas y pedidos realizados</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} size="lg" leftIcon={ICON_PLUS}>
          Nuevo Pedido
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Pedidos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{summary.cantidadPedidos}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Ventas</p>
              <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">{formatCOP(summary.totalVentas)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {ICON_SEARCH}
          </div>
          <Input
            placeholder="Buscar por cliente o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            leftIcon={null}
          />
        </div>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader
          title={`Pedidos (${filteredSales.length}/${sales.length})`}
          subtitle="Historial de ventas registradas"
        />
        <CardContent className="p-0">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 px-6">
              {ICON_CART_LG}
              <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-4">
                {sales.length === 0 ? 'No hay pedidos registrados' : 'No se encontraron pedidos'}
              </p>
              {sales.length === 0 && (
                <Button onClick={() => setShowModal(true)} leftIcon={ICON_PLUS}>
                  Crear primer pedido
                </Button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredSales}
              keyExtractor={(s) => s.id}
              hoverable
              striped
            />
          )}
        </CardContent>
      </Card>

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { e.stopPropagation(); handleModalClose(); }}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title="Nuevo Pedido"
              subtitle="Registra una nueva venta"
              action={
                <Button variant="ghost" size="sm" onClick={handleModalClose} aria-label="Cerrar">
                  {ICON_X}
                </Button>
              }
            />
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Producto"
                  options={productOptions}
                  placeholder="Selecciona un producto"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  error={errors.product_id}
                />

                <Select
                  label="Cliente"
                  options={clientOptions}
                  placeholder="Selecciona un cliente"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  error={errors.client_id}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Cantidad"
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    error={errors.qty}
                    min={1}
                  />
                  <Input
                    label="Precio unitario (COP)"
                    type="number"
                    name="precio_unitario_cop"
                    value={formData.precio_unitario_cop}
                    onChange={handleChange}
                    error={errors.precio_unitario_cop}
                    min={1}
                    step={1}
                    leftIcon={ICON_DOLLAR}
                  />
                </div>

                {/* Preview total */}
                {formData.qty && formData.precio_unitario_cop && (
                  <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-brand-700 dark:text-brand-400">Total estimado</span>
                      <span className="text-lg font-bold font-mono text-brand-700 dark:text-brand-400">
                        {formatCOP(parseInt(formData.qty) * parseInt(formData.precio_unitario_cop || '0'))}
                      </span>
                    </div>
                  </div>
                )}

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
                    Crear Pedido
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
