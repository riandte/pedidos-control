import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Categoria, Produto } from '../../types';
import { useCart } from '../../contexts/useCart';
import { Home, Receipt, ShoppingCart, Clock, MapPin, AlertCircle } from 'lucide-react';
import { CartDrawer } from '../../components/CartDrawer';
import '../../App.css';

interface Config {
  nomeLoja: string;
  endereco: string;
  horario: string;
  mensagem: string;
  aberto: boolean;
}

export function ClientMenu() {
  const navigate = useNavigate();
  const { cart, cartTotalItems, removeFromCart, clearCart } = useCart();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'cart'>('home');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, configRes] = await Promise.all([
          api.get('/categorias'),
          api.get('/produtos'),
          api.get('/configuracoes')
        ]);
        setCategorias(catRes.data);
        setProdutos(prodRes.data);
        setConfig(configRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Helper for images
  const getImage = (produto: Produto) => {
    if (produto.imagemUrl) return produto.imagemUrl;
    return 'https://placehold.co/200x150?text=Sem+Foto';
  };

  // Logic for "Mais Pedidos" (Mocking: take first 5 items)
  const maisPedidos = produtos.slice(0, 5);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="logo-area">
            <div className="logo-container">
               <img src="https://cdn-icons-png.flaticon.com/512/3132/3132693.png" alt="Logo" style={{ width: '24px' }} />
            </div>
            <span>{config?.nomeLoja || 'Carregando...'}</span>
          </div>
          {/* Actions removed */}
        </div>
      </header>

      {/* Greeting */}
      <div style={{ padding: '1rem 1rem 0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#2f3542' }}>
          Olá, Visitante 👋
        </h2>
        <p style={{ color: '#747d8c', margin: 0 }}>O que vamos comer hoje?</p>
      </div>

      {/* Category Pills */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        overflowX: 'auto', 
        padding: '1rem', 
        scrollbarWidth: 'none' 
      }}>
        {categorias.map(cat => (
          <button 
            key={cat.id}
            onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '8px 16px',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#4b5563',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Store Info Bar */}
      <div className="store-info-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <Clock size={16} color={config?.aberto ? '#22c55e' : '#ef4444'} />
          <span className={`store-status ${!config?.aberto ? 'closed' : ''}`} style={{ color: config?.aberto ? '#22c55e' : '#ef4444' }}>
            {config?.aberto ? `Aberto • ${config?.horario}` : 'FECHADO'}
          </span>
        </div>
        
        {config?.endereco && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#666' }}>
            <MapPin size={16} />
            <span>{config.endereco}</span>
          </div>
        )}

        {!config?.aberto && config?.mensagem && (
           <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px', borderRadius: '8px', width: '100%', fontSize: '0.85rem', display: 'flex', gap: '6px' }}>
             <AlertCircle size={16} />
             <span>{config.mensagem}</span>
           </div>
        )}
      </div>

      <div style={{ paddingBottom: '80px' }}> {/* Content Wrapper */}
        
        {/* Mais Pedidos Section */}
        <div className="section-container">
          <div className="section-title">🔥 Destaques da Casa</div>
          <div className="horizontal-scroll">
            {maisPedidos.map(produto => (
              <div key={produto.id} className="card-vertical" onClick={() => navigate(`/produto/${produto.id}`)}>
                <img src={getImage(produto)} alt={produto.nome} />
                <div className="card-content">
                  <h3>{produto.nome}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div className="price">R$ {Number(produto.precoBase).toFixed(2)}</div>
                    <div style={{ 
                      background: '#fff0f1', 
                      color: '#ff4757', 
                      borderRadius: '8px', 
                      width: '28px', 
                      height: '28px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>+</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Sections */}
        {categorias.map(cat => {
          const catItems = produtos.filter(i => i.categoriaId === cat.id);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="section-container" style={{ scrollMarginTop: '120px' }}>
              <div className="section-title">{cat.nome}</div>
              <div className="items-grid">
                {catItems.map(item => (
                  <div key={item.id} className="card-horizontal" onClick={() => navigate(`/produto/${item.id}`)}>
                    <div className="info">
                      <h3>{item.nome}</h3>
                      <p className="desc">{item.descricao || 'Sem descrição'}</p>
                      <div className="price">R$ {Number(item.precoBase).toFixed(2)}</div>
                    </div>
                    <div className="image-container">
                      <img src={getImage(item)} alt={item.nome} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span>Início</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Receipt size={24} />
          <span>Pedidos</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setIsCartOpen(true)}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {cartTotalItems > 0 && (
              <span className="nav-badge">{cartTotalItems}</span>
            )}
          </div>
          <span>Carrinho</span>
        </button>
      </div>

      {/* Modals */}
      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          onClose={() => setIsCartOpen(false)} 
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          storeOpen={config?.aberto ?? true}
        />
      )}
    </div>
  );
}
