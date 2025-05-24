import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const usuariosAutorizados = [
    { email: 'cliente1@teste.com', senha: '123456' },
    { email: 'cliente2@teste.com', senha: 'abcdef' },
    { email: 'cliente3@teste.com', senha: 'senha123' },
  ];

  const handleLogin = () => {
    const usuarioEncontrado = usuariosAutorizados.find(
      (usuario) => usuario.email === email && usuario.senha === senha
    );

    if (usuarioEncontrado) {
      onLogin();
    } else {
      setErro('Usuário ou senha inválidos');
      onLogin();
    }
  };

  return (
    <div className="page">
      <div className="login-card">
        <h2 className="welcome">Bem vindo!</h2>
        <div className="input-container">
          <input
            type="email"
            placeholder="Usuário"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="input-field"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <p className="error-message">{erro}</p>}
          <div className="button-container">
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
