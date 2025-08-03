import React, { useEffect } from 'react'; // Importa useEffect aqui
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumoPage.css';

function ResumoPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // --- CORREÇÃO AQUI ---
  // O Hook useEffect é chamado no topo do componente, antes de qualquer retorno.
  useEffect(() => {
    // A condição 'if' foi movida para DENTRO do Hook.
    if (!state) {
      navigate('/home');
    }
  }, [state, navigate]); // Adicionamos 'state' e 'navigate' como dependências.

  // Se o estado ainda não existe, retornamos null para não renderizar o resto.
  // Isto é seguro agora, porque todos os Hooks já foram chamados acima.
  if (!state) {
    return null;
  }

  // Agora podemos desestruturar o estado com segurança.
  const { id, nome, pedido, total, dataAbertura, numero_sequencial, garcom } = state;

  const finalizarComanda = async () => {
    if (!id) {
      console.error('ID da comanda é inválido. Não é possível finalizar.');
      return;
    }

    try {
      await axios.put(`https://backendcmd.onrender.com/comandas/${id}`, {
        status: 'fechada',
      });
      navigate('/home');
    } catch (error) {
      console.error('Erro ao finalizar comanda:', error);
      alert('Não foi possível finalizar a comanda. Tente novamente.');
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
        <p><strong>Comanda:</strong> {String(numero_sequencial || id).padStart(2, '0')}</p>
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
          {/* Adicionamos uma verificação para garantir que 'pedido' existe antes de mapear */}
          {pedido && pedido.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.qtd}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="resumo-total-box">
        {/* Adicionamos uma verificação para garantir que 'total' existe */}
        <strong>Total da Comanda: R$ {total ? total.toFixed(2) : '0.00'}</strong>
      </div>

      <button className="resumo-print" onClick={() => window.print()}>Imprimir</button>
      <button className="resumo-voltar" onClick={finalizarComanda}>
        Finalizar e Voltar
      </button>
    </div>
  );
}

export default ResumoPage;