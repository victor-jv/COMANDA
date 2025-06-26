import React, { useState } from 'react';
import './LoginPage.css';

// --- INÍCIO DA LÓGICA DE AUTENTICAÇÃO ---

// Lista de usuários autorizados. No futuro, isso pode vir de um banco de dados.
const usuariosAutorizados = [
  // Usuário Administrador
  { email: 'admin@email.com', senha: 'admin123', role: 'admin' },

  // Usuários Garçons
  { email: 'garcom1@email.com', senha: 'garcom1', role: 'garcom' },
  { email: 'garcom2@email.com', senha: 'garcom2', role: 'garcom' },
  { email: 'garcom3@email.com', senha: 'garcom3', role: 'garcom' },
  { email: 'garcom4@email.com', senha: 'garcom4', role: 'garcom' },
  { email: 'garcom5@email.com', senha: 'garcom5', role: 'garcom' },
];

/**
 * Função que simula a autenticação de um usuário.
 * @param {string} email - O email para autenticar.
 * @param {string} senha - A senha para autenticar.
 * @returns {object|null} O objeto do usuário se for válido, senão null.
 */
const autenticarUsuario = (email, senha) => {
  const usuarioEncontrado = usuariosAutorizados.find(
    (user) => user.email === email && user.senha === senha
  );

  // Se encontrou, retorna um objeto com os dados essenciais do usuário.
  // Não é uma boa prática retornar a senha.
  if (usuarioEncontrado) {
    return {
      email: usuarioEncontrado.email,
      role: usuarioEncontrado.role,
    };
  }

  // Se não encontrou, retorna null.
  return null;
};

// --- FIM DA LÓGICA DE AUTENTICAÇÃO ---


const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = () => {
    setErro(''); // Limpa erros anteriores

    // Verifica as credenciais usando nossa função de autenticação
    const usuarioValidado = autenticarUsuario(email, senha);

    if (usuarioValidado) {
      // Se o usuário for válido, chama a função onLoginSuccess
      // que foi passada pelo App.js, enviando os dados do usuário.
      onLoginSuccess({
        token: 'fake-jwt-token', // Em um app real, o backend geraria um token
        user: usuarioValidado,
      });
    } else {
      // Se as credenciais estiverem incorretas, exibe uma mensagem de erro.
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="page">
      <div className="login-card">
        <h2 className="welcome">Bem vindo!</h2>
        <div className="input-container">
          <input
            type="email"
            placeholder="E-mail"
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
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()} // Permite fazer login com a tecla Enter
          />
          {erro && <p className="error-message">{erro}</p>}
          <div className="button-container">
            <button className="login-button" onClick={handleLogin}>
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;