import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Trash, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';

interface Adicional {
  id?: string;
  nome: string;
  preco: number;
  ingredienteRefId?: string | null;
}

interface GrupoAdicional {
  id: string;
  nome: string;
  minEscolhas: number;
  maxEscolhas: number;
  adicionais: Adicional[];
}

interface Ingrediente {
  id: string;
  nome: string;
}

export function AdminGruposAdicionais() {
  const [grupos, setGrupos] = useState<GrupoAdicional[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [minEscolhas, setMinEscolhas] = useState(0);
  const [maxEscolhas, setMaxEscolhas] = useState(1);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);

  const fetchGrupos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/grupos-adicionais');
      setGrupos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const res = await api.get('/admin/ingredientes');
      setIngredientes(res.data);
    } catch (err) {
        console.error(err);
    }
  }

  useEffect(() => {
    fetchGrupos();
    fetchIngredientes();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setNome('');
    setMinEscolhas(0);
    setMaxEscolhas(1);
    setAdicionais([]);
    setShowModal(true);
  };

  const openEdit = (g: GrupoAdicional) => {
    setEditingId(g.id);
    setNome(g.nome);
    setMinEscolhas(g.minEscolhas);
    setMaxEscolhas(g.maxEscolhas);
    setAdicionais(g.adicionais.map(a => ({...a})));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nome, minEscolhas, maxEscolhas, adicionais };
    try {
      if (editingId) {
        await api.put(`/admin/grupos-adicionais/${editingId}`, payload);
      } else {
        await api.post('/admin/grupos-adicionais', payload);
      }
      setShowModal(false);
      fetchGrupos();
    } catch (err) {
      alert('Erro ao salvar grupo');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Excluir grupo?')) return;
    try {
      await api.delete(`/admin/grupos-adicionais/${id}`);
      fetchGrupos();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const addAdicionalOption = () => {
    setAdicionais([...adicionais, { nome: '', preco: 0, ingredienteRefId: null }]);
  };

  const removeAdicionalOption = (index: number) => {
    const newAds = [...adicionais];
    newAds.splice(index, 1);
    setAdicionais(newAds);
  };

  const updateAdicional = (index: number, field: keyof Adicional, value: string | number | null) => {
    const newAds = [...adicionais];
    newAds[index] = { ...newAds[index], [field]: value };
    setAdicionais(newAds);
  };

  return (
    <div>
      <PageHeader 
        title="Grupos de Adicionais" 
        action={
          <Button onClick={openNew}>
            <Plus size={20} /> Novo Grupo
          </Button>
        } 
      />

      {loading ? <p>Carregando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {grupos.map(g => (
            <div key={g.id} style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{g.nome}</h3>
                  <small style={{ color: '#666' }}>Min: {g.minEscolhas} / Max: {g.maxEscolhas}</small>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(g)} title="Editar">
                        <Edit size={18} color="#3498db" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)} title="Excluir">
                        <Trash size={18} color="#e74c3c" />
                    </Button>
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                <small style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Opções ({g.adicionais.length}):</small>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                  {g.adicionais.map((ad, i) => (
                    <li key={ad.id || i}>{ad.nome} (+R$ {Number(ad.preco).toFixed(2)})</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? 'Editar Grupo' : 'Novo Grupo'}
        width="700px"
      >
        <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '0.5rem' }}>
            <div>
                <Input label="Nome do Grupo" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div>
                <Input label="Mín." type="number" min="0" value={minEscolhas} onChange={e => setMinEscolhas(Number(e.target.value))} />
            </div>
            <div>
                <Input label="Máx." type="number" min="1" value={maxEscolhas} onChange={e => setMaxEscolhas(Number(e.target.value))} />
            </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontWeight: 'bold' }}>Opções de Adicionais</label>
                <Button type="button" variant="secondary" size="sm" onClick={addAdicionalOption}>+ Adicionar Opção</Button>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '6px' }}>
                {adicionais.map((ad, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 2 }}>
                        <Input 
                            placeholder="Nome Opção" 
                            value={ad.nome} 
                            onChange={e => updateAdicional(idx, 'nome', e.target.value)}
                            required
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Preço" 
                            value={ad.preco} 
                            onChange={e => updateAdicional(idx, 'preco', Number(e.target.value))}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <div style={{ flex: 1.5 }}>
                        <Select 
                            value={ad.ingredienteRefId || ''} 
                            onChange={e => updateAdicional(idx, 'ingredienteRefId', e.target.value || null)}
                            style={{ marginBottom: 0 }}
                            options={[
                                { value: '', label: '(Sem vínculo)' },
                                ...ingredientes.map(ing => ({ value: ing.id, label: ing.nome }))
                            ]}
                        />
                    </div>

                    <Button type="button" variant="ghost" onClick={() => removeAdicionalOption(idx)} style={{ color: '#e74c3c', padding: '10px' }}>
                        <X size={18} />
                    </Button>
                </div>
                ))}
                {adicionais.length === 0 && <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Nenhuma opção adicionada</p>}
            </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
}
