import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ✅ agora aponta para seu backend local
});

export default api;
