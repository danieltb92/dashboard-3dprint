import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Package, Filter } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, createColumns } from '../components/ui/Table';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface Product {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  precio_venta_cop: number;
  activa: boolean;
  color: string | null;
  linea: string | null;
  stock_actual: number;
  stock_pedido: number;
  stock_alert: string | null;
  status_produccion: string | null;
}

interface ProductFormData {
  sku: string;
  nombre: string;
  categoria: string;
  precio_venta_cop: string;
  activa: boolean;
  color: string;
  linea: string;
  stock_actual: string;
  stock_pedido: string;
  stock_alert: string;
  status_produccion: string;
}

const categories = ['Llaveros', 'Tags', 'Accesorios', 'Organizadores', 'Pedidos Especiales', 'Internos', 'Otros'] as const;
const colors = ['Blanco', 'Negro', 'Natural', 'Negro-Azul', 'Bicolor', 'Otro'] as const;
const lines = ['Accesorio', 'Pedido Especial', 'Interna', 'Personalizado'] as const;
const stockAlerts = ['In Stock', 'Out of Stock', 'Low in Stock', 'Descontinuado'] as const;
const productionStatuses = ['Backorder', 'Need to Order', 'Pendiente', 'Stand by', 'Completado'] as const;

// Icon constants
const ICON_PACKAGE = <Package className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_PACKAGE_LG = <Package className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />;
const ICON_PACKAGE_SM = <Package className="h-4 w-4" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_PLUS_SM = <Plus className="h-3.5 w-3.5" />;
const ICON_EDIT = <Edit className="h-3.5 w-3.5" />;
const ICON_TRASH = <Trash2 className="h-3.5 w-3.5" />;
const ICON_SEARCH = <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_X = <X className="h-5 w-5" />;
const ICON_DOLLAR = <span className="text-neutral-400 dark:text-neutral-500">$</span>;

const CATEGORY_OPTIONS = categories.map(c => ({ value: c, label: c }));
const COLOR_OPTIONS = colors.map(c => ({ value: c, label: c }));
const LINE_OPTIONS = lines.map(l => ({ value: l, label: l }));
const STOCK_ALERT_OPTIONS = stockAlerts.map(s => ({ value: s, label: s }));
const PRODUCTION_STATUS_OPTIONS = productionStatuses.map(p => ({ value: p, label: p }));

export const Inventory = () => {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    nombre: '',
    categoria: '',
    precio_venta_cop: '',
    activa: true,
    color: '',
    linea: '',
    stock_actual: '0',
    stock_pedido: '0',
    stock_alert: '',
    status_produccion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatCOP = useCallback((value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const filteredProducts = useMemo(() => products.filter(product => {
    const matchesSearch = product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [products, searchQuery, categoryFilter]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.sku.trim()) newErrors.sku = 'SKU es requerido';
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.categoria.trim()) newErrors.categoria = 'Categoría es requerida';
    if (!formData.precio_venta_cop || parseFloat(formData.precio_venta_cop) <= 0) {
      newErrors.precio_venta_cop = 'Precio debe ser mayor a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        precio_venta_cop: parseFloat(formData.precio_venta_cop),
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_pedido: parseInt(formData.stock_pedido) || 0,
        color: formData.color || null,
        linea: formData.linea || null,
        stock_alert: formData.stock_alert || null,
        status_produccion: formData.status_produccion || null,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.post('/products/', payload);
        toast.success('Producto creado exitosamente');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    }
  }, [formData, editingProduct, validateForm, fetchProducts]);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      nombre: product.nombre,
      categoria: product.categoria,
      precio_venta_cop: String(product.precio_venta_cop),
      activa: product.activa,
      color: product.color || '',
      linea: product.linea || '',
      stock_actual: String(product.stock_actual),
      stock_pedido: String(product.stock_pedido),
      stock_alert: product.stock_alert || '',
      status_produccion: product.status_produccion || '',
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  }, [fetchProducts]);

  const resetForm = useCallback(() => {
    setFormData({
      sku: '',
      nombre: '',
      categoria: '',
      precio_venta_cop: '',
      activa: true,
      color: '',
      linea: '',
      stock_actual: '0',
      stock_pedido: '0',
      stock_alert: '',
      status_produccion: '',
    });
    setErrors({});
  }, []);

  const openNewModal = useCallback(() => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleCategoryFilterChange = useCallback((value: string) => {
    setCategoryFilter(value);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  }, [resetForm]);

  const columns = useMemo(() => createColumns<Product>([
    {
      key: 'sku',
      header: 'SKU',
      render: (product) => (
        <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{product.sku}</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Producto',
      render: (product) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[180px] block">{product.nombre}</span>
      ),
    },
    {
      key: 'color',
      header: 'Color',
      render: (product) => (
        product.color ? (
          <Badge variant="neutral" size="sm">{product.color}</Badge>
        ) : (
          <span className="text-neutral-300 dark:text-neutral-600">—</span>
        )
      ),
    },
    {
      key: 'linea',
      header: 'Línea',
      render: (product) => (
        product.linea ? (
          <Badge variant="brand" size="sm">{product.linea}</Badge>
        ) : (
          <span className="text-neutral-300 dark:text-neutral-600">—</span>
        )
      ),
    },
    {
      key: 'stock_actual',
      header: 'Stock',
      align: 'center' as const,
      render: (product) => {
        const actual = product.stock_actual;
        const stockColor = actual <= 0
          ? 'text-danger-600 dark:text-danger-400'
          : actual <= 2
            ? 'text-warning-600 dark:text-warning-400'
            : 'text-success-600 dark:text-success-400';
        return (
          <span className={`font-mono font-semibold text-sm ${stockColor}`}>{actual}</span>
        );
      },
    },
    {
      key: 'stock_pedido',
      header: 'Pedido',
      align: 'center' as const,
      render: (product) => (
        <span className="font-mono text-sm text-neutral-600 dark:text-neutral-400">{product.stock_pedido}</span>
      ),
    },
    {
      key: 'stock_alert',
      header: 'Alerta',
      align: 'center' as const,
      render: (product) => (
        product.stock_alert ? (
          <Badge
            variant={
              product.stock_alert === 'In Stock' ? 'success' :
              product.stock_alert === 'Out of Stock' ? 'danger' :
              product.stock_alert === 'Low in Stock' ? 'warning' : 'neutral'
            }
            size="sm"
          >
            {product.stock_alert}
          </Badge>
        ) : (
          <span className="text-neutral-300 dark:text-neutral-600">—</span>
        )
      ),
    },
    {
      key: 'status_produccion',
      header: 'Status',
      render: (product) => (
        product.status_produccion ? (
          <Badge
            variant={
              product.status_produccion === 'Completado' ? 'success' :
              product.status_produccion === 'Backorder' ? 'warning' :
              product.status_produccion === 'Need to Order' ? 'danger' : 'neutral'
            }
            size="sm"
          >
            {product.status_produccion}
          </Badge>
        ) : (
          <span className="text-neutral-300 dark:text-neutral-600">—</span>
        )
      ),
    },
    {
      key: 'precio_venta_cop',
      header: 'Precio',
      align: 'right' as const,
      render: (product) => (
        <span className="font-mono font-medium text-sm text-neutral-900 dark:text-neutral-100">{formatCOP(product.precio_venta_cop)}</span>
      ),
    },
    {
      key: 'activa',
      header: 'Estado',
      align: 'center' as const,
      render: (product) => (
        <Badge variant={product.activa ? 'success' : 'neutral'} size="sm" dot>
          {product.activa ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(product)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
            aria-label={`Editar ${product.nombre}`}
          >
            {ICON_EDIT}
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:text-danger-400 dark:hover:bg-danger-500/10 transition-colors"
            aria-label={`Eliminar ${product.nombre}`}
          >
            {ICON_TRASH}
          </button>
        </div>
      ),
    },
  ]), [handleEdit, handleDelete, formatCOP]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-48" />
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
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            {ICON_PACKAGE}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-heading">Inventario</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{products.length} productos registrados</p>
          </div>
        </div>
        <Button onClick={openNewModal} leftIcon={ICON_PLUS}>
          Nuevo Producto
        </Button>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Total Productos</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">En Stock</p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400 mt-1">{products.filter(p => p.stock_actual > 0).length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Stock Bajo</p>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-1">{products.filter(p => p.stock_actual >= 0 && p.stock_actual <= 2).length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Sin Stock</p>
          <p className="text-2xl font-bold text-danger-600 dark:text-danger-400 mt-1">{products.filter(p => p.stock_actual <= 0).length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {ICON_SEARCH}
          </div>
          <Input
            placeholder="Buscar por SKU o nombre..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            leftIcon={null}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleCategoryFilterChange('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !categoryFilter
                  ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilterChange(categoryFilter === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {products.length === 0 ? 'Sin productos aún' : 'Sin resultados'}
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 max-w-xs mx-auto">
                {products.length === 0
                  ? 'Registra tu primer producto para empezar a cotizar y controlar tu inventario.'
                  : 'No se encontraron productos con los filtros aplicados.'}
              </p>
              {products.length === 0 && (
                <Button onClick={openNewModal} leftIcon={ICON_PLUS_SM}>
                  Crear primer producto
                </Button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredProducts}
              keyExtractor={(p) => p.id}
              hoverable
              striped
            />
          )}
        </CardContent>
      </Card>

      {/* New/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { e.stopPropagation(); handleModalClose(); }}>
          <Card className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 shrink-0"
              title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              subtitle={editingProduct ? `SKU: ${editingProduct.sku}` : 'Completa la información del producto'}
              action={
                <Button variant="ghost" size="sm" onClick={handleModalClose} aria-label="Cerrar">
                  {ICON_X}
                </Button>
              }
            />
            <CardContent className="p-6 overflow-y-auto flex-1 min-h-0">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={errors.sku}
                  placeholder="Ej: LLK-001"
                  disabled={!!editingProduct}
                />
                <Select
                  label="Categoría"
                  options={CATEGORY_OPTIONS}
                  placeholder="Selecciona categoría"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  error={errors.categoria}
                />
              </div>

              <Input
                label="Nombre del producto"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
                placeholder="Ej: Llavero personalizado 3D"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Color"
                  options={COLOR_OPTIONS}
                  placeholder="Selecciona color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
                <Select
                  label="Línea"
                  options={LINE_OPTIONS}
                  placeholder="Selecciona línea"
                  name="linea"
                  value={formData.linea}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Stock Actual"
                  type="number"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleChange}
                  min={0}
                  step={1}
                  placeholder="0"
                />
                <Input
                  label="Stock Pedido"
                  type="number"
                  name="stock_pedido"
                  value={formData.stock_pedido}
                  onChange={handleChange}
                  min={0}
                  step={1}
                  placeholder="0"
                />
                <Input
                  label="Precio de venta (COP)"
                  type="number"
                  name="precio_venta_cop"
                  value={formData.precio_venta_cop}
                  onChange={handleChange}
                  error={errors.precio_venta_cop}
                  min={1}
                  step={1}
                  placeholder="Ej: 15000"
                  leftIcon={ICON_DOLLAR}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Alerta Stock"
                  options={STOCK_ALERT_OPTIONS}
                  placeholder="Selecciona alerta"
                  name="stock_alert"
                  value={formData.stock_alert}
                  onChange={handleChange}
                />
                <Select
                  label="Status Producción"
                  options={PRODUCTION_STATUS_OPTIONS}
                  placeholder="Selecciona status"
                  name="status_produccion"
                  value={formData.status_produccion}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activa"
                  name="activa"
                  checked={formData.activa}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="activa" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  Producto activo (visible en cotizaciones)
                </label>
              </div>
            </form>
            </CardContent>
            <div className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 shrink-0">
              <div className="flex gap-3">
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
                  form="product-form"
                  isLoading={loading}
                  className="flex-1"
                >
                  {editingProduct ? 'Actualizar' : 'Crear Producto'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};