import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumoPage.css';

function ResumoPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    // Redireciona para home se não houver estado (acesso direto à URL)
    navigate('/home');
    return null;
  }

  const { numero, nome, pedido, total, dataAbertura, numero_sequencial, garcom } = state;

  const finalizarComanda = async () => {
    try {
      await axios.put(`https://backendcmd.onrender.com/comandas/${numero}`, {
        status: 'fechada',
        total: total,
        dataAbertura: dataAbertura,
        // Você pode opcionalmente salvar o nome do garçom na comanda finalizada
        garcom: garcom, 
      });
      navigate('/home');
    } catch (error) {
      console.error('Erro ao finalizar comanda:', error);
      // Adicionar feedback de erro para o usuário aqui se desejar
    }
  };

  return (
    <div className="resumo-container">
      <header className="resumo-header">
        <button className="menu-icon">☰</button>
        <h2 className="resumo-title">TOOL</h2>
      </header>

      <h3 className="resumo-subtitle">RESUMO DA MESA</h3>

      <div className="resumo-box">
        <p><strong>Comanda:</strong> {String(numero_sequencial || numero).padStart(2, '0')}</p>
        <p><strong>Cliente:</strong> {nome}</p>
        <p><strong>Status:</strong> Fechada</p>
        <p><strong>Data de Abertura:</strong> {new Date(dataAbertura).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Sao_Paulo'
          })}</p>
        <p><strong>Garçom:</strong> {garcom}</p>
      </div>

      <table className="resumo-tabela">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtde</th>
          </tr>
        </thead>
        <tbody>
          {pedido.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.qtd}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="resumo-total-box">
        <strong>Total da Comanda: R$ {total.toFixed(2)}</strong>
      </div>

      <button className="resumo-print" onClick={() => window.print()}>Imprimir</button>
      <button className="resumo-voltar" onClick={finalizarComanda}>
        Finalizar e Voltar
      </button>
    </div>
  );
}

export default ResumoPage;