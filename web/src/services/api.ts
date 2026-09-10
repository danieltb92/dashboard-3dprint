import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const healthCheck = () => axios.get('http://localhost:8000/health');

export default api;
