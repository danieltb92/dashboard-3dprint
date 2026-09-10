import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Calculator } from './pages/Calculator';
import { Inventory } from './pages/Inventory';
import { Quotes } from './pages/Quotes';
import { Clientes } from './pages/Clientes';
import { Pedidos } from './pages/Pedidos';
import { Settings } from './pages/Settings';
import { Printers } from './pages/Printers';
import { Materials } from './pages/Materials';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculadora" element={<Calculator />} />
            <Route path="/inventario" element={<Inventory />} />
            <Route path="/cotizaciones" element={<Quotes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/impresoras" element={<Printers />} />
            <Route path="/materiales" element={<Materials />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;