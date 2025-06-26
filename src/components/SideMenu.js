import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css';

// Recebemos `user` e `onLogout` como props do App.js
function SideMenu({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Função para lidar com a navegação e fechar o menu
  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  // Função para lidar com o logout
  const handleLogoutClick = () => {
    onLogout();
    setMenuOpen(false);
  };

  return (
    <>
      <div className="top-bar">
        <button className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <h1 className="logo-title">TOOL</h1>
        <div className="menu-placeholder" />
      </div>

      <div className={`drawer ${menuOpen ? 'open' : ''}`}>
        <button className="close-icon" onClick={() => setMenuOpen(false)}>✖</button>

        {/* --- Itens de Menu --- */}
        <button className="drawer-item" onClick={() => handleNavigate('/home')}>
          Início
        </button>

        {/* ✨ MÁGICA ACONTECENDO AQUI ✨ */}
        {/* Mostra os botões somente se a função do usuário for 'admin' */}
        {user && user.role === 'admin' && (
          <>
            <button className="drawer-item" onClick={() => handleNavigate('/interno')}>
              Sistema Interno
            </button>
            <button className="drawer-item" onClick={() => handleNavigate('/relatorios')}>
              Relatórios
            </button>
          </>
        )}

        <button className="drawer-item" onClick={handleLogoutClick}>
          Sair
        </button>
      </div>
    </>
  );
}

export default SideMenu;