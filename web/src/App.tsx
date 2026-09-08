import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calculator } from './pages/Calculator';
import { Inventory } from './pages/Inventory';
import { Quotes } from './pages/Quotes';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow p-4 flex gap-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <Link to="/calculator">Calculadora</Link>
          <Link to="/inventory">Inventario</Link>
          <Link to="/quotes">Cotizaciones</Link>
        </nav>

        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/quotes" element={<Quotes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
