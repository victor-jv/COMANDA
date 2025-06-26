import axios from 'axios';

const api = axios.create({
  // A URL base do seu backend
  baseURL: 'https://backendcmd.onrender.com', 
});

// Isso é um "interceptor": um código que é executado antes de cada requisição.
api.interceptors.request.use(async (config) => {
  // Pega o token do armazenamento local do navegador
  const token = localStorage.getItem('token');
  
  // Se o token existir, adiciona-o ao cabeçalho de autorização
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;