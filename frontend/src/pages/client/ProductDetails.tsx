import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Produto, GrupoAdicional, ItemCarrinho, Adicional } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../contexts/useCart';
import './ProductDetails.css'; 
import { ChevronLeft, Search, Share2, ChevronDown, ChevronUp } from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [observacao, setObservacao] = useState('');
  const [grupos, setGrupos] = useState<GrupoAdicional[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Produto>(`/produtos/${id}`);
        setProduto(data);
        if (data.gruposAdicionais) {
          setGrupos(data.gruposAdicionais);
        }
      } catch (err) {
        console.error("Erro ao carregar produto", err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Helper for option images
  const getOptionImage = (_ad: Adicional) => {
      // ImageUrl removed from Adicional type, using fallback
      return 'https://placehold.co/100x100?text=...';
  };

  const getProductImage = (prod: Produto) => {
    if (prod.imagemUrl) return prod.imagemUrl;
    return 'https://placehold.co/200x200?text=Produto';
  };

  const toggleSection = (grupoId: string) => {
    setCollapsedSections(prev => ({ ...prev, [grupoId]: !prev[grupoId] }));
  };

  const handleOptionToggle = (grupoId: string, adId: string, max: number) => {
    setSelections(prev => {
      const current = prev[grupoId] || [];
      const isSelected = current.includes(adId);
      
      // Single selection logic (Radio behavior) if max == 1
      if (max === 1) {
          if (isSelected) return prev; 
          return { ...prev, [grupoId]: [adId] };
      }

      // Multiple selection logic
      if (isSelected) {
        return { ...prev, [grupoId]: current.filter(id => id !== adId) };
      } else {
        if (current.length >= max) return prev;
        return { ...prev, [grupoId]: [...current, adId] };
      }
    });
  };

  const validate = () => {
    for (const grupo of grupos) {
      const selectedCount = (selections[grupo.id] || []).length;
      if (selectedCount < grupo.minEscolhas) return false;
    }
    return true;
  };

  const calculateTotal = () => {
    if (!produto) return 0;
    let total = Number(produto.precoBase);
    grupos.forEach(grupo => {
      const selectedIds = selections[grupo.id] || [];
      selectedIds.forEach(adId => {
        const ad = grupo.adicionais.find(a => a.id === adId);
        if (ad) {
            total += Number(ad.preco);
        }
      });
    });
    return total;
  };

  const handleAdd = () => {
      if (!produto) return;

      const descParts: string[] = [];
      const adicionaisPayload: { grupoId: string; adicionaisId: string[] }[] = [];

      grupos.forEach(grupo => {
          const selectedIds = selections[grupo.id] || [];
          if (selectedIds.length > 0) {
              const selectedAds = grupo.adicionais.filter(a => selectedIds.includes(a.id));
              const adsNames = selectedAds.map(a => a.nome).join(', ');
              descParts.push(`${grupo.nome}: ${adsNames}`);
              
              adicionaisPayload.push({
                  grupoId: grupo.id,
                  adicionaisId: selectedIds
              });
          }
      });

      const cartItem: ItemCarrinho = {
          produtoId: produto.id,
          quantidade: 1, 
          observacao: observacao,
          adicionais: adicionaisPayload,
          tempId: Math.random().toString(36).substr(2, 9),
          nomeProduto: produto.nome,
          precoTotalEstimado: calculateTotal(),
          descricaoAdicionais: descParts.join(' | ')
      };

      addToCart(cartItem);
      navigate(-1); // Go back
  };

  if (loading || !produto) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Carregando detalhes...</p>
        </div>
    );
  }

  // Filter modifiers based on search term
  const filteredGrupos = grupos.map(grupo => ({
    ...grupo,
    adicionais: grupo.adicionais.filter(ad => 
       searchTerm === '' || ad.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(grupo => grupo.adicionais.length > 0);

  const displayGrupos = searchTerm ? filteredGrupos : grupos;

  return (
    <div className="product-modal-overlay" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
                <h2>Detalhes do produto</h2>
            </div>
            <div className="modal-actions">
                <Search size={20} />
                <Share2 size={20} />
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="modal-content-scroll">
            {/* Product Hero */}
            <div className="product-hero">
                <div className="product-hero-card">
                    <img src={getProductImage(produto)} alt={produto.nome} className="product-hero-img" />
                    <div className="product-hero-info">
                        <h1>{produto.nome}</h1>
                        <div className="product-hero-price">R$ {Number(produto.precoBase).toFixed(2)}</div>
                        <p className="product-hero-desc">{produto.descricao}</p>
                    </div>
                </div>
            </div>

            <div className="search-bar-details">
                <Search size={16} />
                <input 
                    type="text" 
                    placeholder="Pesquise pelo nome" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#666' }}
                />
            </div>

            <div className="modifiers-container">
                {displayGrupos.map(grupo => {
                    const isCollapsed = collapsedSections[grupo.id];
                    const currentSelections = selections[grupo.id] || [];
                    const isRequired = grupo.minEscolhas > 0;
                    
                    return (
                        <div key={grupo.id} className="modifier-section">
                            <div className="modifier-header-row" onClick={() => toggleSection(grupo.id)}>
                                <div>
                                    <div className="modifier-title">{grupo.nome}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                        {grupo.maxEscolhas > 1 ? `Escolha até ${grupo.maxEscolhas} itens` : 'Escolha 1 item'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className={`modifier-badge ${isRequired ? 'badge-required' : 'badge-optional'}`}>
                                        {isRequired ? 'Obrigatório' : 'Opcional'}
                                    </span>
                                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div className="modifier-options">
                                    {grupo.adicionais.map(ad => {
                                        const isSelected = currentSelections.includes(ad.id);
                                        return (
                                            <div key={ad.id} className="option-item" onClick={() => handleOptionToggle(grupo.id, ad.id, grupo.maxEscolhas)}>
                                                <div className="option-left">
                                                    <img src={getOptionImage(ad)} alt={ad.nome} className="option-img" />
                                                    <div className="option-details">
                                                        <h4>{ad.nome}</h4>
                                                        <div className="option-price">+ R$ {Number(ad.preco).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="option-control">
                                                    {grupo.maxEscolhas === 1 ? (
                                                        <div className={`radio-circle ${isSelected ? 'selected' : ''}`}>
                                                            {isSelected && <div className="radio-dot" />}
                                                        </div>
                                                    ) : (
                                                        <div className={`radio-circle ${isSelected ? 'selected' : ''}`} style={{ borderRadius: '4px' }}>
                                                            {isSelected && <div className="radio-dot" style={{ borderRadius: '2px' }} />}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Observations */}
            <div className="obs-section">
                <label className="obs-title">Observações</label>
                <textarea 
                    className="obs-textarea"
                    placeholder="Ex: Tirar cebola, ovo, etc."
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                />
            </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
            <button className="add-to-cart-btn" onClick={handleAdd} disabled={!validate()}>
                <span>Avançar</span>
            </button>
        </div>
    </div>
  );
};
