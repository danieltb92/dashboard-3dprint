import React, { useState } from 'react';
import api from '../services/api';

export const Calculator = () => {
  const [formData, setFormData] = useState({
    printer_id: '',
    material_id: '',
    pieces: 1,
    hours: 0,
    minutes: 0,
    weight: 0,
  });
  const [printers, setPrinters] = useState([]);

  const [materials, setMaterials] = useState([]);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch printers and materials on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [printersResp, materialsResp] = await Promise.all([
          api.get('/printers'),
          api.get('/materials')
        ]);
        setPrinters(printersResp.data);
        setMaterials(materialsResp.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImportOrcaSlicer = () => {
    alert('Funcionalidad de importaci�n de OrcaSlicer no implementada a�n');
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await api.post('/lots/calculate', {
        ...formData,
        minutos: formData.minutos || 0,
        horas: formData.horas || 0,
        peso_g: formData.weight,
        qty: formData.pieces
      });
      setCalculation(response.data);
    } catch (error) {
      console.error('Error calculating:', error);
      alert('Error al calcular el costo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLot = async () => {
    setLoading(true);
    try {
      const response = await api.post('/lots/', {
        ...formData,
        minutos: formData.minutos || 0,
        horas: formData.horas || 0,
        peso_g: formData.weight,
        qty: formData.pieces
      });
      alert('Lote guardado exitosamente');
      // Reset form or navigate as needed
    } catch (error) {
      console.error('Error saving lot:', error);
      alert('Error al guardar el lote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Calculadora de Costos de Impresi�n 3D</h1>
      
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Datos de Impresi�n</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Printer Select */}
          <div>
            <label className="block text-sm font-medium mb-1">Impresora</label>
            <select
              name="printer_id"
              value={formData.printer_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione una impresora...</option>
              {printers.map(printer => (
                <option key={printer.id} value={printer.id}>
                  {printer.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Material Select */}
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <select
              name="material_id"
              value={formData.material_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un material...</option>
              {materials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.name} (/g)
                </option>
              ))}
            </select>
          </div>
          
          {/* Pieces */}
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad de Piezas</label>
            <input
              type="number"
              name="pieces"
              value={formData.pieces}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">Horas de Impresi�n</label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Minutes */}
          <div>
            <label className="block text-sm font-medium mb-1">Minutos de Impresi�n</label>
            <input
              type="number"
              name="minutes"
              value={formData.minutes}
              onChange={handleChange}
              min="0"
              max="59"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Weight (grams) */}
          <div>
            <label className="block text-sm font-medium mb-1">Peso (gramos)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* OrcaSlicer Button */}
        <div className="mt-4">
          <button
            onClick={handleImportOrcaSlicer}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Importar datos de OrcaSlicer
          </button>
        </div>
      </div>
      
      {/* Consumibles Extra Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Consumibles Extra (por pieza)</h2>
        <p className="text-gray-600">Esta secci�n est� pendiente de implementaci�n detallada de consumibles adicionales.</p>
        {/* Placeholder for extra consumables */}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculando...' : 'Calcular Costo'}
        </button>
        <button
          onClick={handleSaveLot}
          disabled={loading || !calculation}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Lote
        </button>
      </div>
      
      {/* Results Section */}
      {calculation && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Desglose de Costos</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Costo Material:</span>
              <span></span>
            </div>
            <div className="flex justify-between">
              <span>Costo Tiempo de M�quina:</span>
              <span></span>
            </div>
            <div className="flex justify-between">
              <span>Costo Energ�a:</span>
              <span></span>
            </div>
            <div className="flex justify-between">
              <span>Costo Mantenimiento:</span>
              <span></span>
            </div>
            <div className="flex justify-between border-t pt-4 font-semibold">
              <span>COSTO TOTAL:</span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
