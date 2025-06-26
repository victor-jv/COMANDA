import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumoPage.css';

function ResumoPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>Dados da comanda não encontrados.</p>;

  // ✅ Extrai numero_sequencial do state da navegação
  const { numero, nome, pedido, total, dataAbertura, numero_sequencial } = state;

  const finalizarComanda = async () => {
    try {
      // ✅ Salva o total e a dataAbertura (o backend espera o ID longo para o PUT)
      await axios.put(`https://backendcmd.onrender.com/comandas/${numero}`, {
        status: 'fechada',
        total: total,
        dataAbertura: dataAbertura,
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
        {/* ✅ Exibe "Comanda" e o numero_sequencial formatado */}
        <p><strong>Comanda:</strong> {String(numero_sequencial || 'ERR').padStart(2, '0')}</p>
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