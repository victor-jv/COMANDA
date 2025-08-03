import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumoPage.css';

function ResumoPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Se o estado não existir (ex: acesso direto à URL), redireciona para a home
  if (!state) {
    // Idealmente, deve ser feito dentro de um useEffect para evitar avisos
    React.useEffect(() => {
      navigate('/home');
    }, [navigate]);
    return null;
  }

  // --- CORREÇÃO PRINCIPAL AQUI ---
  // Trocamos 'numero' por 'id' para obter o ID real da comanda
  const { id, nome, pedido, total, dataAbertura, numero_sequencial, garcom } = state;

  const finalizarComanda = async () => {
    // Adicionamos uma verificação para garantir que o ID existe antes de fazer a chamada
    if (!id) {
      console.error('ID da comanda é inválido. Não é possível finalizar.');
      return; // Interrompe a função se não houver ID
    }

    try {
      // Usamos a variável 'id' na URL da API
      await axios.put(`https://backendcmd.onrender.com/comandas/${id}`, {
        status: 'fechada', // Apenas enviamos o status, que é o que a rota espera
      });
      navigate('/home');
    } catch (error) {
      console.error('Erro ao finalizar comanda:', error);
      // Aqui você pode adicionar um alerta para o usuário, se desejar
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
        {/* Usamos o id como fallback caso numero_sequencial não exista */}
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