import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backendcmd.onrender.com', // ✅ agora aponta para seu backend local
});

export default api;
