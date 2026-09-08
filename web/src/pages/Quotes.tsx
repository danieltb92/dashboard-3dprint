import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const Quotes = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    // Fetch quotes list
    const fetchQuotes = async () => {
      try {
        const response = await api.get('/quotes');
        setQuotes(response.data);
      } catch (e) {
        console.error('Error fetching quotes', e);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>Cotizaciones</h1>
      <div className='flex gap-4 mb-6 border-b'>
        <button className='pb-2' onClick={() => setActiveTab('new')}>Nueva Cotización</button>
        <button className='pb-2' onClick={() => setActiveTab('list')}>Listado</button>
      </div>

      {activeTab === 'new' ? (
        <div className='bg-white p-6 rounded shadow'>
          <h2 className='text-xl mb-4'>Nueva Cotizaci�n</h2>
          {/* Form fields here */}
        </div>
      ) : (
        <div className='bg-white p-6 rounded shadow'>
          <table className='w-full'>
            <thead>
              <tr className='text-left'>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.client_id}</td>
                  <td>{q.total}</td>
                  <td>{q.status}</td>
                  <td><button className='text-blue-500'>Aceptar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
