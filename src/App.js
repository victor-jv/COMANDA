import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import InternoPage from './pages/InternoPage';
import ComandaPage from './pages/ComandaPage';
import ResumoPage from './pages/ResumoPage'; // ✅ nova página de resumo
import SideMenu from './components/SideMenu';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="App">
      <Router>
        {loggedIn && <SideMenu />}
        <Routes>
          {/* Login */}
          <Route 
            path="/" 
            element={
              loggedIn 
                ? <Navigate to="/home" /> 
                : <LoginPage onLogin={() => setLoggedIn(true)} />
            } 
          />

          {/* Página inicial após login */}
          <Route 
            path="/home" 
            element={
              loggedIn 
                ? <HomePage /> 
                : <Navigate to="/" />
            } 
          />

          {/* Página interna */}
          <Route 
            path="/interno" 
            element={
              loggedIn 
                ? <InternoPage /> 
                : <Navigate to="/" />
            } 
          />

          {/* Página da comanda */}
          <Route 
            path="/comanda/:numero" 
            element={
              loggedIn 
                ? <ComandaPage /> 
                : <Navigate to="/" />
            } 
          />

          {/* ✅ Página de resumo da comanda */}
          <Route 
            path="/resumo" 
            element={
              loggedIn 
                ? <ResumoPage /> 
                : <Navigate to="/" />
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
