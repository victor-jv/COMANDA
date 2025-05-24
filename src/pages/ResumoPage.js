import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumoPage.css';

function ResumoPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>Dados da comanda não encontrados.</p>;

  const { numero, nome, pedido, total, dataAbertura } = state;

  const finalizarComanda = async () => {
    try {
      // Atualiza a comanda no Firebase para "fechada"
      await axios.put(`https://backendcmd.onrender.com/comandas/${numero}`, {
        status: 'fechada',
      });
      navigate('/home');
    } catch (error) {
      console.error('Erro ao finalizar comanda:', error);
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
        <p><strong>Mesa:</strong> {String(numero).padStart(2, '0')}</p>
        <p><strong>Status:</strong> Fechada</p>
        <p><strong>Data de Abertura:</strong> {dataAbertura}</p>
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
