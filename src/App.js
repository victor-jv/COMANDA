import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import InternoPage from './pages/InternoPage';
import ComandaPage from './pages/ComandaPage';
import ResumoPage from './pages/ResumoPage';
import RelatorioPage from './pages/RelatorioPage';
import SideMenu from './components/SideMenu';
import './App.css';

// Componente para proteger rotas que exigem login
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// Componente para proteger rotas que exigem permissão de Admin
const AdminRoute = ({ user, children }) => {
  if (!user || user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Ao carregar o app, verifica se há um usuário salvo no armazenamento local
    const userString = localStorage.getItem('user');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    }
    setLoadingUser(false);
  }, []);

  const handleLogin = (userData) => {
    // Salva o token e os dados do usuário no armazenamento local
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    // Atualiza o estado da aplicação
    setCurrentUser(userData.user);
  };

  const handleLogout = () => {
    // Limpa o armazenamento local e o estado
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  if (loadingUser) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="App">
      <Router>
        {currentUser && <SideMenu user={currentUser} onLogout={handleLogout} notificationMessage={notificationMessage} setNotificationMessage={setNotificationMessage} />}
        <Routes>
          <Route path="/" element={!currentUser ? <LoginPage onLoginSuccess={handleLogin} /> : <Navigate to="/home" />} />
          
          <Route path="/home" element={<ProtectedRoute user={currentUser}><HomePage setNotificationMessage={setNotificationMessage} /></ProtectedRoute>} />
          <Route path="/comanda/:numero" element={<ProtectedRoute user={currentUser}><ComandaPage user={currentUser} /></ProtectedRoute>} />
          <Route path="/resumo" element={<ProtectedRoute user={currentUser}><ResumoPage /></ProtectedRoute>} />

          {/* Rotas de Admin */}
          <Route path="/interno" element={<AdminRoute user={currentUser}><InternoPage /></AdminRoute>} />
          <Route path="/relatorios" element={<AdminRoute user={currentUser}><RelatorioPage /></AdminRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;