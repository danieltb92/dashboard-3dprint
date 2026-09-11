import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Boxes, ShoppingCart, ArrowRight, CheckCircle2, Circle, Printer, Wrench, Calculator, Sun, Moon, Cloud, Lightbulb, TrendingUp, DollarSign, TrendingDown } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
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

interface PrinterType {
  id: number;
  nombre: string;
  activa: boolean;
}

interface MaterialType {
  id: number;
  nombre: string;
  activa: boolean;
}

interface TimelineEvent {
  id: string;
  type: 'quote' | 'lot' | 'sale';
  title: string;
  subtitle: string;
  amount?: number;
  estado?: string;
  fecha: Date;
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffH < 24) return `Hace ${diffH}h`;
  if (diffD === 1) return 'Ayer';
  if (diffD < 7) return `Hace ${diffD} días`;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Buenos días', icon: <Sun className="h-6 w-6 text-amber-500" /> };
  if (hour < 18) return { text: 'Buenas tardes', icon: <Cloud className="h-6 w-6 text-blue-500" /> };
  return { text: 'Buenas noches', icon: <Moon className="h-6 w-6 text-indigo-400" /> };
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'> = {
  cotizada: 'info',
  aceptada: 'success',
  venta: 'brand',
  rechazada: 'danger',
  vencida: 'warning',
};

const STATUS_LABELS: Record<string, string> = {
  cotizada: 'Cotizada',
  aceptada: 'Aceptada',
  venta: 'Vendida',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
};

export const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [productsResp, quotesResp, lotsResp, salesResp, printersResp, materialsResp] = await Promise.all([
        api.get<Product[]>('/products/'),
        api.get<Quote[]>('/quotes/'),
        api.get<Lot[]>('/lots/'),
        api.get<Sale[]>('/sales/'),
        api.get<PrinterType[]>('/printers/'),
        api.get<MaterialType[]>('/materials/'),
      ]);
      setProducts(productsResp.data);
      setQuotes(quotesResp.data);
      setLots(lotsResp.data);
      setSales(salesResp.data);
      setPrinters(printersResp.data);
      setMaterials(materialsResp.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const greeting = getGreeting();
  const userName = useMemo(() => localStorage.getItem('userName') || 'Operador', []);

  // Onboarding checklist
  const onboardingSteps = useMemo(() => [
    {
      id: 'printer',
      label: 'Configurar impresora',
      description: 'Registra tu impresora 3D para calcular costos',
      done: printers.some(p => p.activa),
      icon: <Printer className="h-4 w-4" />,
      link: '/impresoras',
    },
    {
      id: 'material',
      label: 'Agregar material',
      description: 'Añade filamento o resina a tu inventario',
      done: materials.some(m => m.activa),
      icon: <Wrench className="h-4 w-4" />,
      link: '/materiales',
    },
    {
      id: 'quote',
      label: 'Crear cotización',
      description: 'Envía tu primera cotización a un cliente',
      done: quotes.length > 0,
      icon: <FileText className="h-4 w-4" />,
      link: '/cotizaciones',
    },
    {
      id: 'calculate',
      label: 'Calcular costo',
      description: 'Usa la calculadora para conocer el costo real',
      done: lots.length > 0,
      icon: <Calculator className="h-4 w-4" />,
      link: '/calculadora',
    },
  ], [printers, materials, quotes, lots]);

  const completedSteps = onboardingSteps.filter(s => s.done).length;
  const progressPct = Math.round((completedSteps / onboardingSteps.length) * 100);
  const allDone = completedSteps === onboardingSteps.length;

  // Timeline events
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    quotes.forEach(q => {
      events.push({
        id: `quote-${q.id}`,
        type: 'quote',
        title: `Cotización #${q.id}`,
        subtitle: q.client?.nombre || `Cliente #${q.client_id}`,
        amount: q.total,
        estado: q.estado,
        fecha: new Date(q.fecha),
      });
    });

    lots.forEach(l => {
      events.push({
        id: `lot-${l.id}`,
        type: 'lot',
        title: `Lote #${l.id}`,
        subtitle: `${l.qty} pieza${l.qty > 1 ? 's' : ''}`,
        amount: l.costo_total_cop,
        fecha: new Date(l.fecha),
      });
    });

    sales.forEach(s => {
      events.push({
        id: `sale-${s.id}`,
        type: 'sale',
        title: `Venta #${s.id}`,
        subtitle: `${s.qty} unidad${s.qty > 1 ? 'es' : ''}`,
        amount: s.precio_unitario_cop * s.qty,
        fecha: new Date(s.fecha),
      });
    });

    return events.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 8);
  }, [quotes, lots, sales]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.precio_unitario_cop * s.qty, 0);
  const totalCost = lots.reduce((sum, l) => sum + l.costo_total_cop, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-full" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <div className="flex items-center gap-3 animate-fade-in delay-0">
        {greeting.icon}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-heading">
            {greeting.text}, {userName}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Resumen de tu taller de impresión 3D</p>
        </div>
      </div>

      {/* Onboarding Checklist */}
      {!allDone && (
        <Card className="overflow-hidden animate-fade-in delay-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Primeros pasos · {completedSteps} de {onboardingSteps.length}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Completa estos pasos para empezar a usar el dashboard
                </p>
              </div>
              <Badge variant={allDone ? 'success' : 'info'} size="sm">
                {progressPct}%
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-brand-500 dark:bg-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Steps grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {onboardingSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    step.done
                      ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/30'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className={`mt-0.5 ${step.done ? 'text-success-500' : 'text-neutral-400'}`}>
                    {step.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${step.done ? 'text-success-700 dark:text-success-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                      {step.description}
                    </p>
                    {!step.done && (
                      <Link to={step.link} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 mt-1.5 hover:underline">
                        Configurar <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All done celebration */}
      {allDone && (
        <Card className="bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/30 animate-fade-in delay-100">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-success-700 dark:text-success-400">
                ¡Todo listo!
              </h2>
              <p className="text-sm text-success-600 dark:text-success-500">
                Has completado la configuración inicial. Tu taller está listo para funcionar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in delay-200">
        {/* Cotizaciones - Primary card */}
        <Card className="sm:col-span-2 p-6 bg-gradient-to-br from-info-50 to-info-100/50 dark:from-info-500/10 dark:to-info-500/5 border-info-200 dark:border-info-500/30 hover:shadow-md transition-all duration-150">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-info-600 dark:text-info-400">Cotizaciones</p>
              <p className="text-4xl font-bold text-info-700 dark:text-info-300 mt-2">{quotes.length}</p>
              <p className="text-xs text-info-500 dark:text-info-400 mt-1">total realizadas</p>
              {quotes.length > 0 && (
                <div className="flex items-center gap-1 mt-3">
                  <TrendingUp className="h-3.5 w-3.5 text-success-500" />
                  <span className="text-xs font-medium text-success-600 dark:text-success-400">
                    {quotes.filter(q => q.estado === 'aceptada').length} aceptadas
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-info-100 dark:bg-info-500/20 flex items-center justify-center text-info-600 dark:text-info-400">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Productos */}
        <Card className="p-5 hover:shadow-md transition-all duration-150">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Productos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {products.filter(p => p.activa).length}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">activos de {products.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Lotes */}
        <Card className="p-5 hover:shadow-md transition-all duration-150">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Lotes</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{lots.length}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">producciones</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-500/20 flex items-center justify-center text-success-600 dark:text-success-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Ventas */}
        <Card className="p-5 hover:shadow-md transition-all duration-150">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ventas</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{sales.length}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">transacciones</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-50 dark:bg-warning-500/20 flex items-center justify-center text-warning-600 dark:text-warning-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 sm:grid-cols-2 animate-fade-in delay-300">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ingresos por ventas</p>
              <p className="text-3xl font-bold text-success-600 dark:text-success-400 mt-2 font-mono tabular-nums">
                {formatCOP(totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-500/20 flex items-center justify-center text-success-600 dark:text-success-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Costos de producción</p>
              <p className="text-3xl font-bold text-warning-600 dark:text-warning-400 mt-2 font-mono tabular-nums">
                {formatCOP(totalCost)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-50 dark:bg-warning-500/20 flex items-center justify-center text-warning-600 dark:text-warning-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in delay-400">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Acciones rápidas</h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Primary action - Cotización */}
          <Link to="/cotizaciones" className="sm:col-span-2 lg:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-info-50 to-info-100/50 dark:from-info-500/10 dark:to-info-500/5 border-info-200 dark:border-info-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-info-100 dark:bg-info-500/20 flex items-center justify-center text-info-600 dark:text-info-400 group-hover:bg-info-200 dark:group-hover:bg-info-500/30 transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-info-700 dark:text-info-300">Nueva cotización</p>
                  <p className="text-xs text-info-500 dark:text-info-400">Crear para cliente</p>
                </div>
              </div>
            </Card>
          </Link>
          {/* Secondary actions */}
          <Link to="/calculadora">
            <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/30 transition-colors">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Calcular costo</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Costo de producción</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/inventario">
            <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/30 transition-colors">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Inventario</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Ver productos</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/clientes">
            <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-500/20 flex items-center justify-center text-success-600 dark:text-success-400 group-hover:bg-success-100 dark:group-hover:bg-success-500/30 transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Clientes</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Gestionar cartera</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Tips Card */}
      <Card className="bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 animate-fade-in delay-500">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-brand-800 dark:text-brand-300 mb-1">Consejo del día</h3>
              <p className="text-sm text-brand-700 dark:text-brand-400">
                Para calcular costos precisos, incluye siempre el <strong>tiempo de preparación</strong> y <strong>postprocesamiento</strong> en la calculadora. El merma del filamento (generalmente 10-15%) también afecta el costo final.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="animate-fade-in delay-600">
        <CardHeader
          title="Actividad reciente"
          action={
            <div className="flex gap-2">
              <Link to="/cotizaciones">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Cotizaciones
                </Button>
              </Link>
              <Link to="/calculadora">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Calculadora
                </Button>
              </Link>
            </div>
          }
        />
        <CardContent className="p-0">
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Sin actividad aún</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4 max-w-xs mx-auto">
                Crea tu primera cotización o calcula el costo de un producto para empezar.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/cotizaciones">
                  <Button size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                    Nueva cotización
                  </Button>
                </Link>
                <Link to="/calculadora">
                  <Button variant="outline" size="sm" leftIcon={<Calculator className="h-4 w-4" />}>
                    Calculadora
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {timelineEvents.map((event, idx) => (
                <div key={event.id} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      event.type === 'quote' ? 'bg-info-500' :
                      event.type === 'lot' ? 'bg-success-500' :
                      'bg-warning-500'
                    }`} />
                    {idx < timelineEvents.length - 1 && (
                      <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {event.title}
                      </p>
                      {event.estado && (
                        <Badge variant={STATUS_COLORS[event.estado] || 'neutral'} size="sm">
                          {STATUS_LABELS[event.estado] || event.estado}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {event.subtitle}
                    </p>
                  </div>

                  {/* Amount + Time */}
                  <div className="text-right flex-shrink-0">
                    {event.amount !== undefined && (
                      <p className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCOP(event.amount)}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {formatRelativeTime(event.fecha)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
