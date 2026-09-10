import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, variant: ToastVariant) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error'),
    info: (msg: string) => add(msg, 'info'),
  };

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />,
    error: <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400" />,
    info: <Info className="h-4 w-4 text-info-600 dark:text-info-400" />,
  };

  const bgClasses = {
    success: 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/30',
    error: 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/30',
    info: 'bg-info-50 dark:bg-info-500/10 border-info-200 dark:border-info-500/30',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${bgClasses[t.variant]}`}
            role="alert"
          >
            {icons[t.variant]}
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Cerrar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
};
