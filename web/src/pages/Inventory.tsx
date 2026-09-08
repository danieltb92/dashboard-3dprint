import React, { useState, useEffect } from 'react';

export const Inventory = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // API call to /api/products
    console.log('Fetching products...');
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Inventario</h1>
      {/* Tabla de productos */}
      <button className="bg-blue-500 text-white p-2 rounded">Añadir Producto</button>
    </div>
  );
};
