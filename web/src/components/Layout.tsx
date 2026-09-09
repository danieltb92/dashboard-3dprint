import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, Printer, Package, FileText, LayoutDashboard, Settings, Moon, Sun, User, LogOut, ChevronDown, Users, ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calculadora', label: 'Calculadora', icon: Printer },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
];

const userItems = [
  { label: 'Configuración', icon: Settings, path: '/settings' },
  { label: 'Cerrar sesión', icon: LogOut, action: 'logout' },
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

  useEffect(() => {
    // Initialize from system preference on first load
    const stored = localStorage.getItem('darkMode');
    if (stored === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
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
            <span className="text-2xl" aria-hidden="true">🖨️</span>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                3D Print Dashboard
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Menú principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive: active }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${sidebarCollapsed ? 'justify-center' : ''}
                    ${active
                      ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 border-l-4 border-brand-600 dark:border-brand-500'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'}
                    ${sidebarCollapsed && active ? 'border-l-0' : ''}
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section - Collapse toggle + Status */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            {/* Connection status */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Badge variant="success" size="sm" dot>API Conectada</Badge>
              </div>
            )}

            {/* Collapse toggle (desktop) / Close (mobile) */}
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
                  {navItems.find(item =>
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path))
                  )?.label || 'Dashboard'}
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
                      {userItems.map((item) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                          onClick={() => {
                            setUserMenuOpen(false);
                            if (item.path) {
                              navigate(item.path);
                            } else if (item.action === 'logout') {
                              // Handle logout
                            }
                          }}
                        >
                          <item.icon className="h-4 w-4 text-neutral-400" />
                          <span>{item.label}</span>
                        </button>
                      ))}
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