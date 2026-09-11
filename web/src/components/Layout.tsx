import { ReactNode, useState, useEffect, useMemo } from 'react';
import { Link, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, Printer, Package, FileText, LayoutDashboard, Settings, Moon, Sun, User, LogOut, ChevronDown, Users, ShoppingCart, Boxes, Wrench, Circle } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { healthCheck } from '../services/api';

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/calculadora', label: 'Calculadora', icon: Printer },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { path: '/inventario', label: 'Inventario', icon: Package },
      { path: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
      { path: '/clientes', label: 'Clientes', icon: Users },
      { path: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
    ],
  },
  {
    title: 'Taller',
    items: [
      { path: '/impresoras', label: 'Impresoras', icon: Boxes },
      { path: '/materiales', label: 'Materiales', icon: Wrench },
    ],
  },
];

const bottomItems: NavItem[] = [
  { path: '/settings', label: 'Configuración', icon: Settings },
];

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [apiStatus, setApiStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        await healthCheck();
        setApiStatus('ok');
      } catch {
        setApiStatus('error');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const currentPageTitle = useMemo(() => {
    for (const section of navSections) {
      const found = section.items.find(item =>
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(item.path))
      );
      if (found) return found.label;
    }
    if (bottomItems.find(item => location.pathname === item.path)) return 'Configuración';
    return 'Dashboard';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800
          transform transition-all duration-200 ease-out
          lg:translate-x-0
          ${sidebarCollapsed ? 'w-18' : 'w-72'}
          ${window.innerWidth < 1024 ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
        aria-label="Navegación principal"
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className={`flex items-center gap-3 p-4 border-b border-neutral-100 dark:border-neutral-800 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <img src="/assets/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                3D Print Dashboard
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin" role="navigation" aria-label="Menú principal">
            {navSections.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <h3 className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive: active }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                          ${sidebarCollapsed ? 'justify-center' : ''}
                          ${active
                            ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'}
                        `}
                        title={sidebarCollapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge variant="brand" size="sm">{item.badge}</Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            {/* Status Card */}
            {!sidebarCollapsed && (
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
                    <Printer className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Taller</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">Impresión 3D</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {apiStatus === 'loading' && (
                    <>
                      <Circle className="h-2 w-2 fill-neutral-400 text-neutral-400 animate-pulse" />
                      <span className="text-neutral-500">Conectando...</span>
                    </>
                  )}
                  {apiStatus === 'ok' && (
                    <>
                      <Circle className="h-2 w-2 fill-success-500 text-success-500" />
                      <span className="text-success-600 dark:text-success-400 font-medium">Sistema operativo</span>
                    </>
                  )}
                  {apiStatus === 'error' && (
                    <>
                      <Circle className="h-2 w-2 fill-danger-500 text-danger-500" />
                      <span className="text-danger-600 dark:text-danger-400 font-medium">Sin conexión</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Settings link */}
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive: active }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${sidebarCollapsed ? 'justify-center' : ''}
                    ${active
                      ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'}
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}

            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expandir menú' : window.innerWidth < 1024 ? 'Cerrar menú' : 'Colapsar menú'}
              aria-expanded={!sidebarCollapsed}
            >
              {window.innerWidth < 1024 ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronLeft className={`h-5 w-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`lg:ml-72 ${sidebarCollapsed ? 'lg:ml-18' : ''} min-h-screen transition-all duration-200`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile menu button + Page title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={sidebarOpen}
                aria-controls="sidebar"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
                aria-pressed={darkMode}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* User menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300">Usuario</span>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </Button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Usuario Demo</p>
                        <p className="text-xs text-neutral-500">demo@3dprint.local</p>
                      </div>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/settings');
                        }}
                      >
                        <Settings className="h-4 w-4 text-neutral-400" />
                        <span>Configuración</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LogOut className="h-4 w-4 text-neutral-400" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
