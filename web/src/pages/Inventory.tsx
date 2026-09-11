import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, Package, Filter } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
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
}

interface ProductFormData {
  sku: string;
  nombre: string;
  categoria: string;
  precio_venta_cop: string;
  activa: boolean;
}

const categories = ['Llaveros', 'Tags', 'Accesorios', 'Organizadores', 'Otros'] as const;

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
        <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">{product.sku}</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Producto',
      render: (product) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{product.nombre}</span>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (product) => (
        <Badge variant="brand" size="sm">{product.categoria}</Badge>
      ),
    },
    {
      key: 'precio_venta_cop',
      header: 'Precio Venta',
      align: 'right' as const,
      render: (product) => (
        <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100 cop-amount">{formatCOP(product.precio_venta_cop)}</span>
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
      header: 'Acciones',
      align: 'right' as const,
      render: (product) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={ICON_EDIT}
            onClick={() => handleEdit(product)}
            aria-label={`Editar ${product.nombre}`}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={ICON_TRASH}
            onClick={() => handleDelete(product.id)}
            aria-label={`Eliminar ${product.nombre}`}
          >
            Eliminar
          </Button>
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
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            {ICON_PACKAGE}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Inventario de Productos</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Gestiona tu catálogo de productos y stock</p>
          </div>
        </div>
        <Button onClick={openNewModal} size="lg" leftIcon={ICON_PLUS}>
          Nuevo Producto
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
                placeholder="Buscar por SKU o nombre..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                leftIcon={null}
              />
            </div>
            {categoryFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryFilterChange('')}
                leftIcon={<X className="h-3.5 w-3.5" />}
                className="text-neutral-500 dark:text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
              >
                Limpiar filtro
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Categoría:</span>
            <button
              onClick={() => handleCategoryFilterChange('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !categoryFilter
                  ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-500/40'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilterChange(categoryFilter === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-500/40'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader
          title={`Productos (${filteredProducts.length}/${products.length})`}
          subtitle="Lista completa del catálogo"
        />
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
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              subtitle={editingProduct ? `SKU: ${editingProduct.sku}` : 'Completa la información del producto'}
              action={
                <Button variant="ghost" size="sm" onClick={handleModalClose} aria-label="Cerrar">
                  {ICON_X}
                </Button>
              }
            />
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  {editingProduct ? 'Actualizar' : 'Crear Producto'}
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