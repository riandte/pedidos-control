import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Check, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { PageHeader } from '../../components/ui/PageHeader';

interface Produto {
  id: string;
  nome: string;
  precoBase: number;
  categoriaId: string;
  descricao?: string;
  tempoPreparoMin?: number;
  imagemUrl?: string;
  ativo: boolean;
  permiteAdicionais: boolean;
  gruposAdicionais?: { id: string, nome: string }[];
}

interface Categoria {
  id: string;
  nome: string;
}

interface GrupoAdicional {
  id: string;
  nome: string;
}

export function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [grupos, setGrupos] = useState<GrupoAdicional[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState<Partial<Produto> & { gruposIds: string[] }>({
    nome: '',
    precoBase: 0,
    categoriaId: '',
    descricao: '',
    tempoPreparoMin: 0,
    imagemUrl: '',
    ativo: true,
    permiteAdicionais: false,
    gruposIds: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, grpRes] = await Promise.all([
        api.get('/admin/produtos'),
        api.get('/categorias'),
        api.get('/admin/grupos-adicionais')
      ]);
      setProdutos(prodRes.data);
      setCategorias(catRes.data);
      setGrupos(grpRes.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({
      nome: '', precoBase: 0, categoriaId: categorias[0]?.id || '',
      descricao: '', tempoPreparoMin: 15, imagemUrl: '',
      ativo: true, permiteAdicionais: false, gruposIds: []
    });
    setShowModal(true);
  };

  const openEdit = (p: Produto) => {
    setEditingId(p.id);
    setFormData({
      nome: p.nome,
      precoBase: p.precoBase,
      categoriaId: p.categoriaId,
      descricao: p.descricao || '',
      tempoPreparoMin: p.tempoPreparoMin || 0,
      imagemUrl: p.imagemUrl || '',
      ativo: p.ativo,
      permiteAdicionais: p.permiteAdicionais,
      gruposIds: p.gruposAdicionais?.map(g => g.id) || []
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove gruposIds from payload to avoid backend errors
    const { gruposIds, ...rest } = formData;
    
    const payload = {
        ...rest,
        gruposAdicionais: formData.permiteAdicionais ? gruposIds : []
    };
    
    try {
      if (editingId) {
        await api.put(`/admin/produtos/${editingId}`, payload);
      } else {
        await api.post('/admin/produtos', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Erro ao salvar produto');
    }
  };

  const toggleGrupo = (id: string) => {
    const current = formData.gruposIds;
    if (current.includes(id)) {
        setFormData({ ...formData, gruposIds: current.filter(x => x !== id) });
    } else {
        setFormData({ ...formData, gruposIds: [...current, id] });
    }
  };

  const filtered = produtos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader 
        title="Produtos" 
        action={
          <Button onClick={openNew}>
            <Plus size={20} /> Novo Produto
          </Button>
        } 
      />

      <div style={{ marginBottom: '1rem', position: 'relative' }}>
         <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 1 }} />
         <Input 
            placeholder="Buscar produtos..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
         />
      </div>

      {loading ? <p>Carregando...</p> : (
        <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Preço</Th>
                <Th>Categoria</Th>
                <Th>Adicionais?</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map(p => (
                <Tr key={p.id}>
                  <Td>
                    <div style={{ fontWeight: 'bold' }}>{p.nome}</div>
                    <small style={{ color: '#888' }}>{p.descricao}</small>
                  </Td>
                  <Td>R$ {Number(p.precoBase).toFixed(2)}</Td>
                  <Td>
                    {categorias.find(c => c.id === p.categoriaId)?.nome || '-'}
                  </Td>
                  <Td>
                    {p.permiteAdicionais ? (
                        <span style={{ color: '#16a34a', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Sim ({p.gruposAdicionais?.length || 0})
                        </span>
                    ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Não</span>}
                  </Td>
                  <Td>
                    <Badge variant={p.ativo ? 'success' : 'error'}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Editar">
                        <Edit size={18} color="#3498db" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
        </Table>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? 'Editar Produto' : 'Novo Produto'}
        width="800px"
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
            </div>

            <div>
                <Input label="Preço Base (R$)" type="number" step="0.01" value={formData.precoBase} onChange={e => setFormData({...formData, precoBase: Number(e.target.value)})} required />
            </div>

            <div>
                <Select 
                    label="Categoria"
                    value={formData.categoriaId} 
                    onChange={e => setFormData({...formData, categoriaId: e.target.value})} 
                    required 
                    options={[
                        { value: '', label: 'Selecione...' },
                        ...categorias.map(c => ({ value: c.id, label: c.nome }))
                    ]}
                />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem', color: '#333' }}>Descrição</label>
                <textarea 
                    value={formData.descricao} 
                    onChange={e => setFormData({...formData, descricao: e.target.value})} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', height: '60px', boxSizing: 'border-box' }}
                />
            </div>

            <div>
                <Input label="Tempo Preparo (min)" type="number" value={formData.tempoPreparoMin} onChange={e => setFormData({...formData, tempoPreparoMin: Number(e.target.value)})} />
            </div>

            <div>
                <Input label="URL Imagem" type="text" value={formData.imagemUrl} onChange={e => setFormData({...formData, imagemUrl: e.target.value})} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', alignItems: 'center', background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" checked={formData.ativo} onChange={e => setFormData({...formData, ativo: e.target.checked})} id="pAtivo" style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="pAtivo">Produto Ativo</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" checked={formData.permiteAdicionais} onChange={e => setFormData({...formData, permiteAdicionais: e.target.checked})} id="pAdd" style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="pAdd">Permite Adicionais</label>
                </div>
            </div>

            {formData.permiteAdicionais && (
                <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Vincular Grupos de Adicionais:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {grupos.map(g => (
                            <div 
                                key={g.id} 
                                onClick={() => toggleGrupo(g.id)}
                                style={{ 
                                    padding: '6px 12px', 
                                    borderRadius: '20px', 
                                    border: '1px solid',
                                    borderColor: formData.gruposIds.includes(g.id) ? '#3498db' : '#ddd',
                                    background: formData.gruposIds.includes(g.id) ? '#eaf2f8' : 'white',
                                    color: formData.gruposIds.includes(g.id) ? '#3498db' : '#666',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {g.nome}
                            </div>
                        ))}
                        {grupos.length === 0 && <small>Nenhum grupo cadastrado.</small>}
                    </div>
                </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit">Salvar Produto</Button>
            </div>

        </form>
      </Modal>
    </div>
  );
}

