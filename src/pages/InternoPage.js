import React, { useState, useEffect } from 'react';
import './InternoPage.css';
import editIcon from '../Icons/edit.svg';
import trashIcon from '../Icons/trash.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function InternoPage() {
  const [activeTab, setActiveTab] = useState('Categorias');
  const [linePosition, setLinePosition] = useState(0);

  const [categories, setCategories] = useState([]);
  const [itens, setItens] = useState([]);
  const [garcons, setGarcons] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = ['Categorias', 'Itens', 'Garçons'];

  useEffect(() => {
    setLinePosition(tabs.indexOf(activeTab));
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'Categorias') {
        const res = await axios.get('http://localhost:5000/categorias');
        setCategories(res.data);
      }
      if (activeTab === 'Itens') {
        const [resItens, resCats] = await Promise.all([
          axios.get('http://localhost:5000/itens'),
          axios.get('http://localhost:5000/categorias')
        ]);
        setItens(resItens.data);
        setCategories(resCats.data);
      }
      if (activeTab === 'Garçons') {
        const res = await axios.get('http://localhost:5000/garcons');
        setGarcons(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados');
    }
  };

  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
    if (!value) return setNewPrice('');
    value = value.length === 1 ? '0,0' + value : value.length === 2 ? '0,' + value : value.slice(0, -2) + ',' + value.slice(-2);
    setNewPrice(value);
  };

  const handleAddOrEdit = async () => {
    if (
      (activeTab === 'Categorias' || activeTab === 'Garçons') &&
      newItem.trim() === ''
    ) {
      toast.error('❌ Nome é obrigatório!');
      return;
    }
    if (
      activeTab === 'Itens' &&
      (newItem.trim() === '' || newPrice.trim() === '' || (!selectedFile && !newImage) || !selectedCategory)
    ) {
      toast.error('❌ Preencha todos os campos do item!');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'Categorias') {
        editingId
          ? await axios.put(`http://localhost:5000/categorias/${editingId}`, { name: newItem })
          : await axios.post('http://localhost:5000/categorias', { name: newItem });
      }

      if (activeTab === 'Itens') {
        if (selectedFile) {
          const formData = new FormData();
          formData.append('name', newItem);
          formData.append('price', newPrice.replace(',', '.'));
          formData.append('categoriaId', selectedCategory);
          formData.append('image', selectedFile);

          await axios({
            method: editingId ? 'put' : 'post',
            url: `http://localhost:5000/itens${editingId ? `/${editingId}` : ''}`,
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          const body = {
            name: newItem,
            price: newPrice.replace(',', '.'),
            categoriaId: selectedCategory,
          };
          await axios.put(`http://localhost:5000/itens/${editingId}`, body);
        }
      }

      if (activeTab === 'Garçons') {
        editingId
          ? await axios.put(`http://localhost:5000/garcons/${editingId}`, { nome: newItem })
          : await axios.post('http://localhost:5000/garcons', { nome: newItem });
      }

      toast.success('✅ Salvo com sucesso!');
      setNewItem('');
      setNewPrice('');
      setNewImage('');
      setSelectedFile(null);
      setSelectedCategory('');
      setEditingId(null);
      setEditingIndex(null);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar');
    }

    setIsLoading(false);
  };

  const askDeleteItem = (index) => {
    setIndexToDelete(index);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (indexToDelete === null) return;

    try {
      const entity = activeTab === 'Categorias' ? categories :
                     activeTab === 'Itens' ? itens :
                     garcons;
      const id = entity[indexToDelete].id;
      const endpoint = activeTab === 'Garçons' ? 'garcons' : activeTab.toLowerCase();
await axios.delete(`http://localhost:5000/${endpoint}/${id}`);
      toast.success('🗑️ Excluído com sucesso!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir');
    }
    setConfirmDeleteOpen(false);
    setIndexToDelete(null);
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);

    if (activeTab === 'Categorias') {
      setNewItem(categories[index].name);
      setEditingId(categories[index].id);
    }

    if (activeTab === 'Itens') {
      const item = itens[index];
      setNewItem(item.name);
      setNewPrice(item.price);
      setNewImage(item.image_url || '');
      setSelectedCategory(item.categoria_id);
      setEditingId(item.id);
    }

    if (activeTab === 'Garçons') {
      setNewItem(garcons[index].nome);
      setEditingId(garcons[index].id);
    }

    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setEditingIndex(null);
    setNewItem('');
    setNewPrice('');
    setNewImage('');
    setSelectedFile(null);
    setSelectedCategory('');
    setEditingId(null);
  };

  return (
    <div className="home-container">
      <div className="navigation-tabs">
        {tabs.map((tab, index) => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
        <div className="active-line" style={{ transform: `translateX(${linePosition * 100}%)` }} />
      </div>

      <div className="content-area">
        {activeTab === 'Categorias' && (
          <div className="list-categories">
            {categories.length === 0 ? (
              <p className="empty-message">Nenhuma categoria cadastrada</p>
            ) : (
              categories.map((cat, index) => (
                <div key={index} className="category-item">
                  <span className="category-name">{cat.name}</span>
                  <div className="category-actions">
                    <button className="icon-button" onClick={() => handleEditItem(index)}><img src={editIcon} alt="edit" /></button>
                    <button className="icon-button" onClick={() => askDeleteItem(index)}><img src={trashIcon} alt="delete" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Itens' && (
          <div className="list-categories">
            {itens.length === 0 ? (
              <p className="empty-message">Nenhum item cadastrado</p>
            ) : (
              itens.map((item, index) => (
                <div key={index} className="item-box">
                  <img src={item.image_url || 'https://via.placeholder.com/130'} alt="item" className="item-image" />
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">R$ {item.price}</span>
                  </div>
                  <div className="item-actions">
                    <button className="icon-button edit" onClick={() => handleEditItem(index)}><img src={editIcon} alt="edit" /></button>
                    <button className="icon-button delete" onClick={() => askDeleteItem(index)}><img src={trashIcon} alt="delete" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Garçons' && (
          <div className="list-categories">
            {garcons.length === 0 ? (
              <p className="empty-message">Nenhum garçom cadastrado</p>
            ) : (
              garcons.map((garcom, index) => (
                <div key={index} className="category-item">
                  <span className="category-name">{garcom.nome}</span>
                  <div className="category-actions">
                    <button className="icon-button" onClick={() => handleEditItem(index)}><img src={editIcon} alt="edit" /></button>
                    <button className="icon-button" onClick={() => askDeleteItem(index)}><img src={trashIcon} alt="delete" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button className={`add-button ${modalOpen ? 'open' : ''}`} onClick={toggleModal}>＋</button>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={toggleModal}>✖</button>
            <h3>{editingIndex !== null ? 'Editar' : 'Adicionar'} {activeTab.slice(0, -1)}</h3>
            <input type="text" className="input-modal" placeholder="Digite o nome" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
            {activeTab === 'Itens' && (
              <>
                <input type="text" className="input-modal" placeholder="Digite o preço" value={newPrice} onChange={handlePriceChange} />
                <select className="input-modal" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="image-upload">
                  <label htmlFor="fileInput" className="image-upload-label">Escolher Imagem</label>
                  <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewImage(URL.createObjectURL(file));
                      setSelectedFile(file);
                    }
                  }} />
                  {newImage && <div className="image-preview"><img src={newImage} alt="preview" /></div>}
                </div>
              </>
            )}
            <button className="confirm-button" onClick={handleAddOrEdit} disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingIndex !== null ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir?</p>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleConfirmDelete}>Sim, Excluir</button>
              <button className="cancel-button" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
}

export default InternoPage;
