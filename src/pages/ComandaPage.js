import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ComandaPage.css';

function ComandaPage() {
  const { numero } = useParams(); // 'numero' é o ID do Firebase (o ID longo)
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Pedidos da comanda');
  const [nomeCliente, setNomeCliente] = useState(''); // Estado para o nome do cliente
  const [itensDisponiveis, setItensDisponiveis] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAberta, setCategoriaAberta] = useState(null);
  const [pedido, setPedido] = useState({});
  const [comandaSequencial, setComandaSequencial] = useState(''); // Estado para o número da comanda (exibição)
  const tabs = ['Pedidos da comanda', 'Cardápio'];

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 2000);
    return () => clearInterval(intervalo);
  }, [numero]);

  const carregarDados = async () => {
    try {
      const [itensRes, categoriasRes, comandasRes] = await Promise.all([
        axios.get('https://backendcmd.onrender.com/itens'),
        axios.get('https://backendcmd.onrender.com/categorias'),
        axios.get('https://backendcmd.onrender.com/comandas'),
      ]);

      setItensDisponiveis(itensRes.data);
      setCategorias(categoriasRes.data);

      // ✅ Altera para buscar por 'c.numero' para corresponder ao backend
      const comanda = comandasRes.data.find((c) => c.numero === numero); 
      if (comanda) {
        setNomeCliente(comanda.nome); // Define o nome do cliente
        // ✅ Usa comanda.numero (o ID do Firebase) para o número de exibição
        setComandaSequencial(comanda.numero); 
        const pedidoConvertido = {};
        (comanda.itens || []).forEach((item) => {
          pedidoConvertido[item.id] = item.qtd;
        });
        setPedido(pedidoConvertido);
      } else {
        // Se a comanda não for encontrada, exibe um aviso e redireciona para a home
        console.warn(`Comanda com ID '${numero}' não encontrada. Redirecionando para /home.`);
        navigate('/home'); 
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      // Se houver um erro na requisição (ex: rede), também redireciona para evitar tela em branco
      navigate('/home');
    }
  };

  const alterarQtd = (itemId, delta) => {
    setPedido((prev) => {
      const atual = prev[itemId] || 0;
      const novo = Math.max(atual + delta, 0);
      const atualizado = { ...prev };
      if (novo === 0) delete atualizado[itemId];
      else atualizado[itemId] = novo;

      // 'pedidoFirebase' está definido aqui no seu código atual
      const pedidoFirebase = Object.entries(atualizado).map(([id, qtd]) => {
        const item = itensDisponiveis.find((i) => i.id === id);
        return { id, name: item?.name || '', qtd };
      });


      axios
        .put(`https://backendcmd.onrender.com/comandas/${numero}/itens`, { 
          itens: pedidoFirebase,
        })
        .catch((err) => console.error('Erro ao salvar itens da comanda:', err));

      return atualizado;
    });
  };

  const total = Object.entries(pedido).reduce((acc, [id, qtd]) => {
    const item = itensDisponiveis.find((i) => i.id === id);
    if (!item) return acc;
    return acc + qtd * parseFloat(item.price.replace(',', '.'));
  }, 0);

  const finalizarPedido = () => {
    const dataAtualUTC = new Date().toISOString();
    const pedidoFinal = Object.entries(pedido).map(([id, qtd]) => {
      const item = itensDisponiveis.find((i) => i.id === id);
      return { id, name: item?.name, qtd };
    });

    navigate('/resumo', {
      state: {
        numero: numero, 
        nome: nomeCliente,
        total,
        dataAbertura: dataAtualUTC,
        pedido: pedidoFinal,
        // 'numero_sequencial' não é fornecido pelo backend na base atual, então não o passamos
      },
    });
  };

  return (
    <div className="comanda-container">
      <div className="navbar-global">
        <button className="menu-icon">☰</button>
        <h2 className="navbar-title">TOOL</h2>
      </div>

      <div className="comanda-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`comanda-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <div
          className="comanda-line"
          style={{
            transform: `translateX(${tabs.indexOf(activeTab) * 100}%)`,
            width: `${100 / tabs.length}%`,
          }}
        />
      </div>

      <h3 className="comanda-title">
        {/* Exibe "COMANDA", o número (ID do Firebase) e o nome do cliente */}
        COMANDA {String(comandaSequencial).padStart(2, '0')} — {nomeCliente} 
      </h3>

      <div className="comanda-content">
        {activeTab === 'Pedidos da comanda' ? (
          Object.keys(pedido).length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>Nenhum item adicionado</p>
          ) : (
            Object.entries(pedido).map(([id, qtd]) => {
              const item = itensDisponiveis.find((i) => i.id === id);
              return (
                <div key={id} className="comanda-card-img">
                  <img src={item?.image || 'https://via.placeholder.com/50'} alt={item?.name} className="comanda-img" />
                  <div className="comanda-info">
                    <strong>{item?.name}</strong>
                    <span>R$ {item?.price}</span>
                  </div>
                  <div className="comanda-qty">
                    <button onClick={() => alterarQtd(id, -1)}>-</button>
                    <span>{qtd}</span>
                    <button onClick={() => alterarQtd(id, 1)}>+</button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          categorias.map((categoria) => (
            <div key={categoria.id}>
              <button
                className="folder-button"
                onClick={() => setCategoriaAberta(categoriaAberta === categoria.id ? null : categoria.id)}
              >
                {categoria.name} {categoriaAberta === categoria.id ? '▾' : '▸'}
              </button>
              {categoriaAberta === categoria.id &&
                itensDisponiveis
                  .filter((item) => item.categoriaId === categoria.id) 
                  .map((item) => (
                    <div key={item.id} className="comanda-card-img">
                      <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="comanda-img" />
                      <div className="comanda-info">
                        <strong>{item.name}</strong>
                        <span>R$ {item.price}</span>
                      </div>
                      <div className="comanda-qty">
                        <button onClick={() => alterarQtd(item.id, -1)}>-</button>
                        <span>{pedido[item.id] || 0}</span>
                        <button onClick={() => alterarQtd(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
            </div>
          ))
        )}
      </div>

      <div className="comanda-footer">
        <p>Total: R$ {total.toFixed(2)}</p>
        <button className="comanda-finalizar" onClick={finalizarPedido}>
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}

export default ComandaPage;