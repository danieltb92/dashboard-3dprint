import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, FileText, UserPlus, X, DollarSign, Calculator, Printer, Share2, Copy, CheckCircle, Send, FileEdit, MessageSquare, MapPin, Phone, Mail, Building2, Package } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

interface Product {
  id: number;
  sku: string;
  nombre: string;
  precio_venta_cop: number;
}

interface Client {
  id: number;
  codigo: string;
  nombre: string;
  contacto: string;
}

interface QuoteLine {
  id: number;
  product_id: number | null;
  custom_name: string;
  qty: string;
  precio_unitario_cop: string;
  subtotal: number;
}

interface ClientFormData {
  nombre: string;
  contacto: string;
  telefono: string;
  direccion: string;
  notas: string;
  ciudad: string;
  departamento: string;
  empresa: string;
  tipo_documento: string;
  numero_documento: string;
  condicion_pago: string;
}

interface QuoteFormData {
  client_id: string;
  vigencia_dias: number;
  notas: string;
  iva_enabled: boolean;
  envio_cop: number;
  otros_cargos_cop: number;
  lineas: QuoteLine[];
}

// Icon constants to avoid inline JSX recreation
const ICON_CALENDAR = <span className="text-neutral-400 dark:text-neutral-500">📅</span>;
const ICON_DOLLAR = <DollarSign className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
const ICON_PLUS = <Plus className="h-4 w-4" />;
const ICON_PLUS_SM = <Plus className="h-3.5 w-3.5" />;
const ICON_TRASH = <Trash2 className="h-3.5 w-3.5" />;
const ICON_X = <X className="h-5 w-5" />;
const ICON_X_SM = <X className="h-4 w-4" />;
const ICON_USER_PLUS = <UserPlus className="h-3.5 w-3.5" />;
const ICON_CALCULATOR = <Calculator className="h-4 w-4" />;
const ICON_FILE_TEXT = <FileText className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />;
const ICON_FILE_TEXT_SM = <FileText className="h-6 w-6 text-brand-600" />;
const ICON_PACKAGE = <Package className="h-4 w-4" />;

export const Quotes = () => {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');

  const [formData, setFormData] = useState<QuoteFormData>({
    client_id: '',
    vigencia_dias: 8,
    notas: '',
    iva_enabled: false,
    envio_cop: 0,
    otros_cargos_cop: 0,
    lineas: [],
  });

  const [clientForm, setClientForm] = useState<ClientFormData>({
    nombre: '',
    contacto: '',
    telefono: '',
    direccion: '',
    notas: '',
    ciudad: '',
    departamento: '',
    empresa: '',
    tipo_documento: '',
    numero_documento: '',
    condicion_pago: '',
  });

  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingQuote, setAcceptingQuote] = useState<any>(null);
  const [stockCheck, setStockCheck] = useState<{ has_stock: boolean; lines: any[] } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResp, clientsResp, quotesResp] = await Promise.all([
          api.get('/products/?activa=true'),
          api.get('/clients/'),
          api.get('/quotes/'),
        ]);
        setProducts(productsResp.data);
        setClients(clientsResp.data);
        setQuotes(quotesResp.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCOP = useCallback((value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Memoized options
  const productOptions = useMemo(() => [
    { value: '', label: 'Producto personalizado' },
    ...products.map(p => ({ value: String(p.id), label: `${p.sku} - ${p.nombre}` })),
  ], [products]);

  const clientOptions = useMemo(() => clients.map(c => ({
    value: String(c.id),
    label: `${c.codigo} — ${c.nombre}`,
  })), [clients]);

  // Memoized handlers
  const addLine = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lineas: [...prev.lineas, {
        id: Date.now(),
        product_id: null,
        custom_name: '',
        qty: '1',
        precio_unitario_cop: '0',
        subtotal: 0,
      }],
    }));
  }, []);

  const removeLine = useCallback((id: number) => {
    setFormData(prev => ({
      ...prev,
      lineas: prev.lineas.filter(line => line.id !== id),
    }));
  }, []);

  const updateLine = useCallback((id: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      lineas: prev.lineas.map(line => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: value };
        if (field === 'product_id' && value) {
          const product = products.find(p => p.id === parseInt(value));
          if (product) {
            updated.custom_name = product.nombre;
            updated.precio_unitario_cop = String(product.precio_venta_cop);
          }
        }
        const qty = parseInt(updated.qty) || 1;
        const precio = parseFloat(updated.precio_unitario_cop) || 0;
        updated.subtotal = qty * precio;
        return updated;
      }),
    }));
  }, [products]);

  const handleProductChange = useCallback((id: number, value: string) => {
    updateLine(id, 'product_id', value);
  }, [updateLine]);

  const handleCustomNameChange = useCallback((id: number, value: string) => {
    updateLine(id, 'custom_name', value);
  }, [updateLine]);

  const handleQtyChange = useCallback((id: number, value: string) => {
    updateLine(id, 'qty', value);
  }, [updateLine]);

  const handlePrecioChange = useCallback((id: number, value: string) => {
    updateLine(id, 'precio_unitario_cop', value);
  }, [updateLine]);

  const calculateTotals = useCallback(() => {
    const subtotal = formData.lineas.reduce((sum, line) => sum + (line.subtotal || 0), 0);
    const iva = formData.iva_enabled ? Math.round(subtotal * 0.19) : 0;
    const total = subtotal + iva + formData.envio_cop + formData.otros_cargos_cop;
    return { subtotal, iva, total };
  }, [formData.lineas, formData.iva_enabled, formData.envio_cop, formData.otros_cargos_cop]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.client_id) newErrors.client_id = 'Selecciona un cliente';
    if (formData.lineas.length === 0) {
      newErrors.lineas = 'Agrega al menos una línea';
    } else {
      formData.lineas.forEach((line, i) => {
        const qty = parseInt(line.qty);
        const precio = parseFloat(line.precio_unitario_cop);
        if (!qty || qty <= 0) newErrors[`linea_${line.id}_qty`] = 'Cantidad inválida';
        if (!line.product_id && !line.custom_name) newErrors[`linea_${line.id}_producto`] = 'Selecciona un producto';
        if (!precio || precio <= 0) newErrors[`linea_${line.id}_precio`] = 'Precio inválido';
      });
    }
    if (!formData.vigencia_dias || formData.vigencia_dias <= 0) newErrors.vigencia_dias = 'Vigencia inválida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const clearError = useCallback((key: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { subtotal, iva, total } = calculateTotals();
      await api.post('/quotes', {
        client_id: parseInt(formData.client_id),
        lineas_json: formData.lineas,
        subtotal,
        iva,
        envio_cop: formData.envio_cop,
        otros_cargos_cop: formData.otros_cargos_cop,
        total,
        estado: 'cotizada',
        vigencia_dias: formData.vigencia_dias,
      });

      toast.success('Cotización creada exitosamente');
      setFormData({ client_id: '', vigencia_dias: 8, notas: '', iva_enabled: false, envio_cop: 0, otros_cargos_cop: 0, lineas: [] });
      const quotesResp = await api.get('/quotes/');
      setQuotes(quotesResp.data);
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Error al crear la cotización');
    }
  }, [formData, calculateTotals]);

  const handleCreateClient = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clients/', clientForm);
      const clientsResp = await api.get('/clients/');
      setClients(clientsResp.data);
      setShowClientModal(false);
      setClientForm({ nombre: '', contacto: '', telefono: '', direccion: '', notas: '', ciudad: '', departamento: '', empresa: '', tipo_documento: '', numero_documento: '', condicion_pago: '' });
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Error al crear el cliente');
    }
  }, [clientForm]);

  const handleClearForm = useCallback(() => {
    setFormData({ client_id: '', vigencia_dias: 8, notas: '', iva_enabled: false, envio_cop: 0, otros_cargos_cop: 0, lineas: [] });
  }, []);

  const handleOpenAcceptModal = useCallback(async (quote: any) => {
    try {
      const resp = await api.get(`/quotes/${quote.id}/stock-check`);
      setStockCheck(resp.data);
      setAcceptingQuote(quote);
      setShowAcceptModal(true);
    } catch (error) {
      console.error('Error checking stock:', error);
      toast.error('Error al verificar stock');
    }
  }, []);

  const handleAcceptDirectSale = useCallback(async () => {
    if (!acceptingQuote) return;
    try {
      await api.post(`/quotes/${acceptingQuote.id}/accept-sale`);
      const quotesResp = await api.get('/quotes/');
      setQuotes(quotesResp.data);
      setShowAcceptModal(false);
      setAcceptingQuote(null);
      setStockCheck(null);
      toast.success('Venta creada exitosamente');
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Error al crear la venta');
    }
  }, [acceptingQuote]);

  const handleStartProduction = useCallback(async () => {
    if (!acceptingQuote) return;
    try {
      await api.patch(`/quotes/${acceptingQuote.id}/start-production`);
      const quotesResp = await api.get('/quotes/');
      setQuotes(quotesResp.data);
      setShowAcceptModal(false);
      setAcceptingQuote(null);
      setStockCheck(null);
    } catch (error) {
      console.error('Error starting production:', error);
      toast.error('Error al iniciar producción');
    }
  }, [acceptingQuote]);

  const handleCompleteProduction = useCallback(async (quoteId: number) => {
    try {
      await api.patch(`/quotes/${quoteId}/complete-production`);
      const quotesResp = await api.get('/quotes/');
      setQuotes(quotesResp.data);
      toast.success('Producción completada y venta creada');
    } catch (error) {
      console.error('Error completing production:', error);
      toast.error('Error al completar producción');
    }
  }, []);

  const handleNotasChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, notas: value }));
  }, []);

  const handleVigenciaChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, vigencia_dias: parseInt(value) || 8 }));
  }, []);

  const handleClientChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, client_id: value }));
  }, []);

  const getStatusBadge = useCallback((estado: string) => {
    const styles: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'> = {
      cotizada: 'info',
      aceptada: 'warning',
      vendida: 'brand',
      rechazada: 'danger',
      vencida: 'neutral',
    };
    return styles[estado] || 'neutral';
  }, []);

  const { subtotal, iva, total } = calculateTotals();

  // New Quote Tab Content
  const NewQuoteTab = useMemo(() => (
    <div className="space-y-6">
      {/* Client & Validity */}
      <Card>
        <CardHeader
          title="Datos de la Cotización"
          subtitle="Selecciona cliente, vigencia y agrega observaciones"
        />

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Cliente"
              options={clientOptions}
              placeholder="Selecciona un cliente"
              name="client_id"
              value={formData.client_id}
              onChange={(e) => { handleClientChange(e.target.value); clearError('client_id'); }}
              error={errors.client_id}
            />
            <div className="flex flex-col">
              <Input
                label="Vigencia (días)"
                type="number"
                name="vigencia_dias"
                value={formData.vigencia_dias}
                onChange={(e) => { handleVigenciaChange(e.target.value); clearError('vigencia_dias'); }}
                min={1}
                leftIcon={ICON_CALENDAR}
                error={errors.vigencia_dias}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowClientModal(true)} leftIcon={ICON_USER_PLUS}>
              Nuevo Cliente
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Observaciones (opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => handleNotasChange(e.target.value)}
              placeholder="Notas adicionales, términos de entrega, condiciones especiales..."
              rows={2}
              className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors duration-150 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Lines */}
      <Card>
        <CardHeader
          title="Líneas de Cotización"
          subtitle={`${formData.lineas.length} ${formData.lineas.length === 1 ? 'línea' : 'líneas'} agregadas`}
          action={
            formData.lineas.length > 0 ? (
              <Button variant="outline" size="sm" onClick={addLine} leftIcon={ICON_PLUS_SM}>
                Agregar línea
              </Button>
            ) : undefined
          }
        />

        <CardContent className="p-0">
          {formData.lineas.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 mx-6 mb-6 rounded-xl">
              {ICON_FILE_TEXT}
              <p className="text-neutral-500 dark:text-neutral-400 mb-1 font-medium">Sin líneas agregadas</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">Agrega productos o servicios para comenzar</p>
              <Button variant="primary" onClick={addLine} leftIcon={ICON_PLUS}>
                Agregar primera línea
              </Button>
              {errors.lineas && <p className="text-sm text-danger-600 dark:text-danger-400 mt-2" role="alert">{errors.lineas}</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="w-12 px-3 py-3 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Producto</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Descripción</th>
                    <th className="w-24 px-3 py-3 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Cant.</th>
                    <th className="w-40 px-3 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">P. Unitario</th>
                    <th className="w-36 px-3 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Subtotal</th>
                    <th className="w-12 px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                  {formData.lineas.map((line, index) => (
                    <tr key={line.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                      {/* Line Number */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-500/20 items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-400">
                          {index + 1}
                        </span>
                      </td>

                      {/* Product Select */}
                      <td className="px-3 py-3">
                        <Select
                          options={productOptions}
                          placeholder="Seleccionar..."
                          value={line.product_id ? String(line.product_id) : ''}
                          onChange={(e) => { handleProductChange(line.id, e.target.value); clearError(`linea_${line.id}_producto`); }}
                          error={errors[`linea_${line.id}_producto`]}
                        />
                      </td>

                      {/* Description */}
                      <td className="px-3 py-3">
                        <Input
                          name="custom_name"
                          value={line.custom_name}
                          onChange={(e) => handleCustomNameChange(line.id, e.target.value)}
                          placeholder="Nombre"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="px-3 py-3">
                        <Input
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) => { handleQtyChange(line.id, e.target.value); clearError(`linea_${line.id}_qty`); }}
                          className="text-center w-full"
                          error={errors[`linea_${line.id}_qty`]}
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="px-3 py-3">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={line.precio_unitario_cop}
                          onChange={(e) => { handlePrecioChange(line.id, e.target.value); clearError(`linea_${line.id}_precio`); }}
                          leftIcon={ICON_DOLLAR}
                          error={errors[`linea_${line.id}_precio`]}
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                          {formatCOP(line.subtotal || 0)}
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="inline-flex w-8 h-8 items-center justify-center rounded-lg text-neutral-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                          aria-label={`Eliminar línea ${index + 1}`}
                        >
                          {ICON_TRASH}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {formData.lineas.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button variant="outline" onClick={addLine} leftIcon={ICON_PLUS} className="w-full sm:w-auto">
                Agregar otra línea
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals & Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Resumen de la Cotización" />
            <CardContent className="space-y-4">
              {formData.client_id ? (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {clients.find(c => c.id === parseInt(formData.client_id))?.nombre || 'Cliente'}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {clients.find(c => c.id === parseInt(formData.client_id))?.contacto || ''}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">Selecciona un cliente para continuar</p>
              )}

              {formData.notas && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Observaciones</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{formData.notas}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Líneas</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formData.lineas.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Vigencia</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formData.vigencia_dias}d</p>
                </div>
                <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-center">
                  <p className="text-xs text-brand-700 dark:text-brand-400 mb-1">Total</p>
                  <p className="text-xl font-bold font-mono text-brand-700 dark:text-brand-400 tabular-nums">{formatCOP(total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals Card */}
        <Card className="bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 h-fit">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
              <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">{formatCOP(subtotal)}</span>
            </div>

            {/* IVA Toggle */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600 dark:text-neutral-400">IVA (19%)</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, iva_enabled: !prev.iva_enabled }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    formData.iva_enabled ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    formData.iva_enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">{formatCOP(iva)}</span>
            </div>

            {/* Envio */}
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-600 dark:text-neutral-400">Envío</span>
              <div className="flex items-center gap-1">
                <span className="text-neutral-400 dark:text-neutral-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={formData.envio_cop || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, envio_cop: parseInt(e.target.value) || 0 }))}
                  className="w-28 text-right font-mono text-sm px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Otros Cargos */}
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-600 dark:text-neutral-400">Otros cargos</span>
              <div className="flex items-center gap-1">
                <span className="text-neutral-400 dark:text-neutral-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={formData.otros_cargos_cop || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, otros_cargos_cop: parseInt(e.target.value) || 0 }))}
                  className="w-28 text-right font-mono text-sm px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-t-2 border-brand-200 dark:border-brand-500/40">
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">TOTAL</span>
              <span className="text-2xl font-bold font-mono text-brand-700 dark:text-brand-400 tabular-nums">{formatCOP(total)}</span>
            </div>
          </CardContent>
          <CardFooter className="border-t border-brand-100 dark:border-brand-500/30 flex-col gap-3">
            <Button
              onClick={handleSubmit}
              size="lg"
              leftIcon={<FileEdit className="h-4 w-4" />}
              className="w-full"
              disabled={!formData.client_id || formData.lineas.length === 0}
            >
              Crear Cotización
            </Button>
            <Button variant="ghost" onClick={handleClearForm} leftIcon={ICON_X_SM} className="w-full text-neutral-500">
              Limpiar formulario
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ), [clientOptions, formData, clients, productOptions, subtotal, iva, total, formatCOP, addLine, removeLine, handleProductChange, handleCustomNameChange, handleQtyChange, handlePrecioChange, handleClearForm, handleClientChange, handleVigenciaChange, handleNotasChange]);

  // List Tab Content
  const ListTab = useMemo(() => {
    const columns = [
      {
        key: 'id',
        header: 'ID',
        align: 'left' as const,
        render: (quote: any) => <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">#{quote.id}</span>,
      },
      {
        key: 'client',
        header: 'Cliente',
        render: (quote: any) => (
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{quote.client?.nombre || 'N/A'}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{quote.client?.contacto || ''}</p>
          </div>
        ),
      },
      {
        key: 'fecha',
        header: 'Fecha',
        render: (quote: any) => (
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {new Date(quote.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        ),
      },
      {
        key: 'vigencia',
        header: 'Vigencia',
        align: 'center' as const,
        render: (quote: any) => (
          <Badge variant="neutral" size="sm">{quote.vigencia_dias} días</Badge>
        ),
      },
      {
        key: 'total',
        header: 'Total',
        align: 'right' as const,
        render: (quote: any) => (
          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 cop-amount">{formatCOP(quote.total)}</span>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        align: 'center' as const,
        render: (quote: any) => (
          <Badge variant={getStatusBadge(quote.estado)} size="sm" dot>
            {quote.estado.charAt(0).toUpperCase() + quote.estado.slice(1)}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Acciones',
        align: 'right' as const,
        render: (quote: any) => (
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setSelectedQuote(quote)}>
            Ver detalle
          </Button>
        ),
      },
    ];

    return (
      <Card>
        <CardHeader
          title="Listado de Cotizaciones"
          subtitle={`Total: ${quotes.length} cotizaciones`}
        />
        <CardContent className="p-0">
          {quotes.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Sin cotizaciones aún</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 max-w-xs mx-auto">
                Crea tu primera cotización para empezar a vender productos impresos en 3D.
              </p>
              <p className="text-neutral-400 dark:text-neutral-500 text-xs">Usa la pestaña "Nueva Cotización" para comenzar</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={quotes}
              keyExtractor={(q: any) => q.id}
              hoverable
              striped
            />
          )}
        </CardContent>
      </Card>
    );
  }, [quotes, formatCOP, getStatusBadge]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700">
          <SkeletonTable rows={4} />
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
            {ICON_FILE_TEXT_SM}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Cotizaciones</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Gestiona tus cotizaciones y clientes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex gap-1" aria-label="Pestañas de cotizaciones">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'new'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
            role="tab"
            aria-selected={activeTab === 'new'}
          >
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">Nueva Cotización</span>
              <span className="sm:hidden">Nueva</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
            role="tab"
            aria-selected={activeTab === 'list'}
          >
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">Listado</span>
              <Badge variant="brand" size="sm" className="ml-1">{quotes.length}</Badge>
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === 'new' && NewQuoteTab}
      {activeTab === 'list' && ListTab}

      {/* New Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { e.stopPropagation(); setShowClientModal(false); }}>
           <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title="Nuevo Cliente"
              subtitle="Registra los datos del cliente para futuras cotizaciones"
              action={
                <Button variant="ghost" size="sm" onClick={() => setShowClientModal(false)} aria-label="Cerrar">
                  {ICON_X}
                </Button>
              }
            />
            <CardContent className="p-6">
              <form onSubmit={handleCreateClient} className="space-y-6">
                {/* Datos Personales */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Datos Personales</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre completo"
                      name="nombre"
                      value={clientForm.nombre}
                      onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                    <Input
                      label="Empresa / Razón social"
                      name="empresa"
                      value={clientForm.empresa}
                      onChange={(e) => setClientForm({ ...clientForm, empresa: e.target.value })}
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
                      value={clientForm.tipo_documento}
                      onChange={(e) => setClientForm({ ...clientForm, tipo_documento: e.target.value })}
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
                      value={clientForm.numero_documento}
                      onChange={(e) => setClientForm({ ...clientForm, numero_documento: e.target.value })}
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
                      value={clientForm.contacto}
                      onChange={(e) => setClientForm({ ...clientForm, contacto: e.target.value })}
                      required
                      placeholder="juan@empresa.com"
                      leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
                    />
                    <Input
                      label="Teléfono"
                      name="telefono"
                      value={clientForm.telefono}
                      onChange={(e) => setClientForm({ ...clientForm, telefono: e.target.value })}
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
                      value={clientForm.ciudad}
                      onChange={(e) => setClientForm({ ...clientForm, ciudad: e.target.value })}
                      placeholder="Ej: Bogotá D.C."
                      leftIcon={<MapPin className="h-4 w-4 text-neutral-400" />}
                    />
                    <Input
                      label="Departamento"
                      name="departamento"
                      value={clientForm.departamento}
                      onChange={(e) => setClientForm({ ...clientForm, departamento: e.target.value })}
                      placeholder="Ej: Cundinamarca"
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Dirección"
                      name="direccion"
                      value={clientForm.direccion}
                      onChange={(e) => setClientForm({ ...clientForm, direccion: e.target.value })}
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
                    value={clientForm.condicion_pago}
                    onChange={(e) => setClientForm({ ...clientForm, condicion_pago: e.target.value })}
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
                    value={clientForm.notas}
                    onChange={(e) => setClientForm({ ...clientForm, notas: e.target.value })}
                    placeholder="Preferencias, historial, referencias..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors duration-150 resize-none"
                  />
                </div>

                <CardFooter className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" leftIcon={<UserPlus className="h-4 w-4" />}>
                    Crear Cliente
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedQuote(null)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10"
              title=""
              action={
                <Button variant="ghost" size="sm" onClick={() => setSelectedQuote(null)} aria-label="Cerrar">
                  {ICON_X}
                </Button>
              }
            />
            <CardContent className="p-0">
              {/* Printable Document */}
              <div id="quote-document" className="bg-white dark:bg-neutral-900">
                {/* Document Header */}
                <div className="px-8 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🖨️</span>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">3D Print Dashboard</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Impresión 3D bajo demanda</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">COTIZACIÓN</p>
                      <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400">#{String(selectedQuote.id).padStart(4, '0')}</p>
                    </div>
                  </div>
                </div>

                {/* Document Meta */}
                <div className="px-8 py-4 grid grid-cols-2 gap-6 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Cliente</p>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedQuote.client?.nombre || 'Cliente no encontrado'}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{selectedQuote.client?.contacto || ''}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Fecha</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {new Date(selectedQuote.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Vigencia</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedQuote.vigencia_dias} días</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Estado</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(selectedQuote.estado)} size="md" dot>
                          {selectedQuote.estado.charAt(0).toUpperCase() + selectedQuote.estado.slice(1)}
                        </Badge>
                        {selectedQuote.produccion_estado && (
                          <Badge variant={selectedQuote.produccion_estado === 'en_produccion' ? 'warning' : 'success'} size="sm">
                            {selectedQuote.produccion_estado === 'en_produccion' ? 'En producción' : 'Producción completa'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lines Table */}
                <div className="px-8 py-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
                        <th className="text-left py-3 font-semibold text-neutral-700 dark:text-neutral-300">#</th>
                        <th className="text-left py-3 font-semibold text-neutral-700 dark:text-neutral-300">Producto / Descripción</th>
                        <th className="text-center py-3 font-semibold text-neutral-700 dark:text-neutral-300">Cant.</th>
                        <th className="text-right py-3 font-semibold text-neutral-700 dark:text-neutral-300">P. Unitario</th>
                        <th className="text-right py-3 font-semibold text-neutral-700 dark:text-neutral-300">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                      {selectedQuote.lineas_json && selectedQuote.lineas_json.map((line: any, i: number) => (
                        <tr key={i}>
                          <td className="py-3 text-neutral-500 dark:text-neutral-400">{i + 1}</td>
                          <td className="py-3 font-medium text-neutral-900 dark:text-neutral-100">{line.custom_name || `Producto #${line.product_id}`}</td>
                          <td className="py-3 text-center text-neutral-600 dark:text-neutral-400">{line.qty}</td>
                          <td className="py-3 text-right font-mono text-neutral-600 dark:text-neutral-400">{formatCOP(line.precio_unitario_cop)}</td>
                          <td className="py-3 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">{formatCOP(line.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="px-8 py-4 border-t-2 border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-end">
                    <div className="w-72 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                        <span className="font-mono text-neutral-900 dark:text-neutral-100">{formatCOP(selectedQuote.subtotal)}</span>
                      </div>
                      {selectedQuote.iva > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">IVA (19%)</span>
                          <span className="font-mono text-neutral-900 dark:text-neutral-100">{formatCOP(selectedQuote.iva)}</span>
                        </div>
                      )}
                      {selectedQuote.envio_cop > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">Envío</span>
                          <span className="font-mono text-neutral-900 dark:text-neutral-100">{formatCOP(selectedQuote.envio_cop)}</span>
                        </div>
                      )}
                      {selectedQuote.otros_cargos_cop > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">Otros cargos</span>
                          <span className="font-mono text-neutral-900 dark:text-neutral-100">{formatCOP(selectedQuote.otros_cargos_cop)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t-2 border-brand-200 dark:border-brand-500/40">
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">TOTAL</span>
                        <span className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400">{formatCOP(selectedQuote.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="px-8 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    Esta cotización tiene una vigencia de {selectedQuote.vigencia_dias} días a partir de la fecha de emisión.
                    Los precios están en Pesos Colombianos (COP){selectedQuote.iva > 0 ? ' e incluyen IVA.' : '.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    leftIcon={<Printer className="h-4 w-4" />}
                    onClick={() => window.print()}
                  >
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Copy className="h-4 w-4" />}
                    onClick={() => {
                      const text = `Cotización #${selectedQuote.id}\nCliente: ${selectedQuote.client?.nombre}\nTotal: ${formatCOP(selectedQuote.total)}\nVigencia: ${selectedQuote.vigencia_dias} días`;
                      navigator.clipboard.writeText(text);
                      toast.success('Cotización copiada al portapapeles');
                    }}
                  >
                    Copiar resumen
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Send className="h-4 w-4" />}
                    onClick={() => {
                      const text = `Hola ${selectedQuote.client?.nombre}, su cotización #${selectedQuote.id} por un total de ${formatCOP(selectedQuote.total)} está lista. Vigencia: ${selectedQuote.vigencia_dias} días. ¿Desea proceder?`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    WhatsApp
                  </Button>
                  <div className="flex-1" />
                  {selectedQuote.estado === 'cotizada' && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={async () => {
                          try {
                            await api.patch(`/quotes/${selectedQuote.id}/status`, { estado: 'rechazada' });
                            const quotesResp = await api.get('/quotes/');
                            setQuotes(quotesResp.data);
                            setSelectedQuote(null);
                          } catch (error) {
                            console.error('Error updating quote status:', error);
                            toast.error('Error al actualizar el estado');
                          }
                        }}
                      >
                        Rechazar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                        onClick={() => handleOpenAcceptModal(selectedQuote)}
                      >
                        Aceptar
                      </Button>
                    </>
                  )}
                  {selectedQuote.estado === 'aceptada' && selectedQuote.produccion_estado === 'en_produccion' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      onClick={() => handleCompleteProduction(selectedQuote.id)}
                    >
                      Completar producción
                    </Button>
                  )}
                  {selectedQuote.estado === 'rechazada' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await api.patch(`/quotes/${selectedQuote.id}/status`, { estado: 'cotizada' });
                          const quotesResp = await api.get('/quotes');
                          setQuotes(quotesResp.data);
                          setSelectedQuote(null);
                        } catch (error) {
                          console.error('Error updating quote status:', error);
                          toast.error('Error al actualizar el estado');
                        }
                      }}
                    >
                      Reabrir cotización
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accept Quote Modal */}
      {showAcceptModal && acceptingQuote && stockCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowAcceptModal(false); setAcceptingQuote(null); setStockCheck(null); }}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader
              className="border-b border-neutral-100 dark:border-neutral-800"
              title="Aceptar Cotización"
              subtitle={`Cotización #${acceptingQuote.id} — ${acceptingQuote.client?.nombre || ''}`}
              action={
                <Button variant="ghost" size="sm" onClick={() => { setShowAcceptModal(false); setAcceptingQuote(null); setStockCheck(null); }}>
                  {ICON_X_SM}
                </Button>
              }
            />
            <CardContent className="p-6 space-y-4">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Stock disponible:</p>
                <div className="mt-2 space-y-1">
                  {stockCheck.lines.map((line: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">{line.nombre}</span>
                      <Badge variant={line.has_stock ? 'success' : 'warning'} size="sm">
                        {line.has_stock ? 'En stock' : 'Sin stock'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {stockCheck.has_stock && (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                    onClick={handleAcceptDirectSale}
                    className="w-full"
                  >
                    Venta directa (hay stock)
                  </Button>
                )}
                <Button
                  variant={stockCheck.has_stock ? 'outline' : 'primary'}
                  size="lg"
                  leftIcon={<Package className="h-4 w-4" />}
                  onClick={handleStartProduction}
                  className="w-full"
                >
                  {stockCheck.has_stock ? 'Iniciar producción (opcional)' : 'Iniciar producción'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};