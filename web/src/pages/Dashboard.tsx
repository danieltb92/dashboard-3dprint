import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Boxes, ShoppingCart, ArrowRight } from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import api from '../services/api';

interface Product {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  precio_venta_cop: number;
  activa: boolean;
}

interface Quote {
  id: number;
  client_id: number;
  total: number;
  estado: string;
  fecha: string;
  client?: { nombre: string };
}

interface Lot {
  id: number;
  qty: number;
  costo_total_cop: number;
  fecha: string;
  printer_id: number;
  material_id: number;
}

interface Sale {
  id: number;
  product_id: number;
  qty: number;
  precio_unitario_cop: number;
  fecha: string;
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'> = {
  cotizada: 'info',
  aceptada: 'success',
  venta: 'brand',
  rechazada: 'danger',
  vencida: 'warning',
};

const ICON_DASHBOARD = <LayoutDashboard className="h-6 w-6 text-brand-600 dark:text-brand-400" />;
const ICON_PACKAGE = <Package className="h-5 w-5" />;
const ICON_FILE_TEXT = <FileText className="h-5 w-5" />;
const ICON_BOXES = <Boxes className="h-5 w-5" />;
const ICON_CART = <ShoppingCart className="h-5 w-5" />;

export const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [productsResp, quotesResp, lotsResp, salesResp] = await Promise.all([
        api.get<Product[]>('/products/'),
        api.get<Quote[]>('/quotes/'),
        api.get<Lot[]>('/lots/'),
        api.get<Sale[]>('/sales/'),
      ]);
      setProducts(productsResp.data);
      setQuotes(quotesResp.data);
      setLots(lotsResp.data);
      setSales(salesResp.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeProducts = products.filter(p => p.activa).length;
  const recentQuotes = quotes.slice(0, 5);
  const recentLots = lots.slice(0, 5);

  const totalRevenue = sales.reduce((sum, s) => sum + s.precio_unitario_cop * s.qty, 0);
  const totalCost = lots.reduce((sum, l) => sum + l.costo_total_cop, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
            <Skeleton className="h-5 w-32" />
            <SkeletonTable rows={3} />
          </div>
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
            <Skeleton className="h-5 w-32" />
            <SkeletonTable rows={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
          {ICON_DASHBOARD}
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Resumen de tu taller de impresión 3D</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Productos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{activeProducts}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">activos de {products.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              {ICON_PACKAGE}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Cotizaciones</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{quotes.length}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">total realizadas</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-info-50 dark:bg-info-500/20 flex items-center justify-center text-info-600 dark:text-info-400">
              {ICON_FILE_TEXT}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Lotes</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{lots.length}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">producciones</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-500/20 flex items-center justify-center text-success-600 dark:text-success-400">
              {ICON_BOXES}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ventas</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{sales.length}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">transacciones</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-50 dark:bg-warning-500/20 flex items-center justify-center text-warning-600 dark:text-warning-400">
              {ICON_CART}
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ingresos por ventas</p>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400 mt-2 font-mono tabular-nums">
            {formatCOP(totalRevenue)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Costos de producción</p>
          <p className="text-3xl font-bold text-warning-600 dark:text-warning-400 mt-2 font-mono tabular-nums">
            {formatCOP(totalCost)}
          </p>
        </Card>
      </div>

      {/* Recent Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quotes */}
        <Card>
          <CardHeader
            title="Últimas Cotizaciones"
            action={
              <Link to="/cotizaciones">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Ver todas
                </Button>
              </Link>
            }
          />
          <CardContent className="p-0">
            {recentQuotes.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
                <p>No hay cotizaciones aún</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {quote.client?.nombre || `Cliente #${quote.client_id}`}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(quote.fecha)}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Badge variant={STATUS_COLORS[quote.estado] || 'neutral'} size="sm">
                        {quote.estado}
                      </Badge>
                      <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCOP(quote.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Lots */}
        <Card>
          <CardHeader
            title="Últimos Lotes"
            action={
              <Link to="/calculadora">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Calculadora
                </Button>
              </Link>
            }
          />
          <CardContent className="p-0">
            {recentLots.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
                <p>No hay lotes de producción aún</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentLots.map((lot) => (
                  <div key={lot.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Lote #{lot.id} — {lot.qty} piezas
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(lot.fecha)}</p>
                    </div>
                    <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100 tabular-nums ml-4">
                      {formatCOP(lot.costo_total_cop)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
