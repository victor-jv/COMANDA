import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

function HomePage({ setNotificationMessage }) {
  const [activeTab, setActiveTab] = useState('Em andamento');
  const [linePosition, setLinePosition] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [comandas, setComandas] = useState([]);
  const [novoNome, setNewNome] = useState('');
  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAberta, setCategoriaAberta] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteSingle, setConfirmDeleteSingle] = useState(null);

  const navigate = useNavigate();
  const tabs = ['Em andamento', 'Comandas', 'Finalizadas', 'Cardápio'];

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    setLinePosition(index);

    const interval = setInterval(() => {
      if (activeTab === 'Cardápio') carregarItensECategorias();
      else carregarComandas();
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const carregarComandas = async () => {
    try {
      const res = await axios.get('https://backendcmd.onrender.com/comandas');
      setComandas(res.data);
    } catch (err) {
      console.error('Erro ao carregar comandas:', err);
    }
  };

  const carregarItensECategorias = async () => {
    try {
      const [resItens, resCategorias] = await Promise.all([
        axios.get('https://backendcmd.onrender.com/itens'),
        axios.get('https://backendcmd.onrender.com/categorias'),
      ]);
      setItens(resItens.data);
      setCategorias(resCategorias.data);
    } catch (err) {
      console.error('Erro ao carregar itens e categorias:', err);
    }
  };

  const salvarComanda = async () => {
    if (novoNome.trim() === '') return;

    const comandaData = {
      nome: novoNome,
      numero: Date.now().toString(),
      status: 'aberta',
      createdAt: new Date().toISOString(),
      itens: [],
    };

    try {
      await axios.post('https://backendcmd.onrender.com/comandas', comandaData);
      setModalOpen(false);
      setNewNome('');
      setNotificationMessage(`✅ Comanda ${comandaData.nome} criada com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar no Firebase:', err);
    }
  };

  const excluirComanda = async (numero) => {
    try {
      await axios.delete(`https://backendcmd.onrender.com/comandas/${numero}`);
    } catch (err) {
      console.error('Erro ao excluir comanda:', err);
    }
    setConfirmDeleteSingle(null);
  };

  const excluirTodasFinalizadas = async () => {
    const finalizadas = comandas.filter((c) => c.status === 'fechada');
    try {
      await Promise.all(
        finalizadas.map((c) =>
          axios.delete(`https://backendcmd.onrender.com/comandas/${c.numero}`)
        )
      );
    } catch (err) {
      console.error('Erro ao excluir todas as finalizadas:', err);
    }
    setConfirmDeleteAll(false);
  };

  const toggleCategoria = (id) => {
    setCategoriaAberta(categoriaAberta === id ? null : id);
  };

  const renderComandaBox = (comanda, index, colorClass = '') => (
    <div
      className={`comanda-box-fixed ${colorClass}`}
      onClick={() => navigate(`/comanda/${comanda.numero}`)}
    >
      <button
        className="delete-comanda"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmDeleteSingle(comanda.numero);
        }}
      >
        ✖
      </button>
      <span className="comanda-nome">{comanda.nome}</span>
      <span className="comanda-numero">{String(index + 1).padStart(2, '0')}</span>
    </div>
  );

  return (
    <div className="home-container">
      <div className="navigation-tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <div
          className="active-line"
          style={{
            transform: `translateX(${linePosition * 100}%)`,
            width: `${100 / tabs.length}%`,
          }}
        />
      </div>

      <div className="content-area">
        {activeTab === 'Em andamento' && (
          <div className="comanda-grid-fixed">
            {comandas
              .filter((c) => c.status === 'aberta' && c.itens && c.itens.length > 0)
              .map((comanda, index) => (
                <div key={comanda.numero}>
                  {renderComandaBox(comanda, index, 'comanda-verde')}
                </div>
              ))}
          </div>
        )}

        {activeTab === 'Comandas' && (
          <div className="comanda-grid-fixed">
            {comandas
              .filter((c) => c.status === 'aberta' && (!c.itens || c.itens.length === 0))
              .map((comanda, index) => (
                <div key={comanda.numero}>
                  {renderComandaBox(comanda, index, 'comanda-amarela')}
                </div>
              ))}
            <div
              className="comanda-box-fixed add-button-fixed"
              onClick={() => setModalOpen(true)}
            >
              ＋
            </div>
          </div>
        )}

        {activeTab === 'Finalizadas' && (
          <div>
            <button className="login-button" onClick={() => setConfirmDeleteAll(true)}>
              Apagar todas as finalizadas
            </button>
            <div className="comanda-grid-fixed">
              {comandas
                .filter((c) => c.status === 'fechada')
                .map((comanda, index) => (
                  <div key={comanda.numero}>
                    {renderComandaBox(comanda, index, 'comanda-vermelha')}
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'Cardápio' && (
          <div className="list-categories">
            {categorias.map((cat) => (
              <div key={cat.id}>
                <button className="folder-button" onClick={() => toggleCategoria(cat.id)}>
                  {cat.name} {categoriaAberta === cat.id ? '▾' : '▸'}
                </button>
                <div className={`item-list ${categoriaAberta === cat.id ? '' : 'hidden'}`}>
                  {categoriaAberta === cat.id &&
                    itens
                      .filter((item) => item.categoriaId === cat.id)
                      .map((item) => (
                        <div key={item.id} className="item-box">
                          <img src={item.image} alt={item.name} className="item-image" />
                          <div className="item-details">
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">R$ {item.price}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setModalOpen(false)}>✖</button>
            <h3>Nova Comanda</h3>
            <input
              type="text"
              className="input-field"
              placeholder="Nome do cliente"
              value={novoNome}
              onChange={(e) => setNewNome(e.target.value)}
            />
            <button className="login-button" onClick={salvarComanda}>Salvar</button>
          </div>
        </div>
      )}

      {confirmDeleteSingle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Confirmar Exclusão</h3>
            <p>Deseja excluir esta comanda?</p>
            <button className="confirm-button" onClick={() => excluirComanda(confirmDeleteSingle)}>
              Sim, Excluir
            </button>
            <button className="cancel-button" onClick={() => setConfirmDeleteSingle(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {confirmDeleteAll && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Apagar todas as comandas finalizadas?</h3>
            <p>Essa ação não pode ser desfeita.</p>
            <button className="confirm-button" onClick={excluirTodasFinalizadas}>
              Sim, Apagar Todas
            </button>
            <button className="cancel-button" onClick={() => setConfirmDeleteAll(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
