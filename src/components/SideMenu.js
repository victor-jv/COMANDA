import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css';

function SideMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="top-bar">
        <button className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <h1 className="logo-title">TOOL</h1>
        <div className="menu-placeholder" />
      </div>

      <div className={`drawer ${menuOpen ? 'open' : ''}`}>
        <button className="close-icon" onClick={() => setMenuOpen(false)}>✖</button>
        <button className="drawer-item" onClick={() => { navigate('/home'); setMenuOpen(false); }}>
          Início
        </button>
        <button className="drawer-item" onClick={() => { navigate('/interno'); setMenuOpen(false); }}>
          Sistema Interno
        </button>
        <button className="drawer-item" onClick={() => window.location.reload()}>
          Sair
        </button>
      </div>
    </>
  );
}

export default SideMenu;
