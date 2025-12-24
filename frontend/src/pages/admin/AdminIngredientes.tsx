import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { PageHeader } from '../../components/ui/PageHeader';

interface Ingrediente {
  id: string;
  nome: string;
  ativo: boolean;
}

export function AdminIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [filtered, setFiltered] = useState<Ingrediente[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: '', ativo: true });

  const fetchIngredientes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ingredientes');
      setIngredientes(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(ingredientes.filter(i => i.nome.toLowerCase().includes(lower)));
  }, [search, ingredientes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/ingredientes/${editingId}`, formData);
      } else {
        await api.post('/admin/ingredientes', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ nome: '', ativo: true });
      fetchIngredientes();
    } catch (err) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/admin/ingredientes/${id}`);
      fetchIngredientes();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const openEdit = (ing: Ingrediente) => {
    setEditingId(ing.id);
    setFormData({ nome: ing.nome, ativo: ing.ativo });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: '', ativo: true });
    setShowModal(true);
  };

  return (
    <div>
      <PageHeader 
        title="Ingredientes" 
        action={
          <Button onClick={openNew}>
            <Plus size={20} /> Novo Ingrediente
          </Button>
        } 
      />

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <Input 
                placeholder="Buscar ingredientes..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
            />
        </div>
      </div>

      {loading ? <p>Carregando...</p> : (
        <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map(ing => (
                <Tr key={ing.id}>
                  <Td>{ing.nome}</Td>
                  <Td>
                    <Badge variant={ing.ativo ? 'success' : 'error'}>
                      {ing.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(ing)} title="Editar">
                            <Edit size={18} color="#3498db" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ing.id)} title="Excluir">
                            <Trash size={18} color="#e74c3c" />
                        </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <Tr>
                    <Td style={{ textAlign: 'center', color: '#888' }}>
                        Nenhum ingrediente encontrado.
                    </Td>
                </Tr>
              )}
            </Tbody>
        </Table>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
        width="400px"
      >
        <form onSubmit={handleSave}>
            <Input 
                label="Nome"
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                required
            />
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
                type="checkbox" 
                checked={formData.ativo} 
                onChange={e => setFormData({...formData, ativo: e.target.checked})}
                id="ativoCheck"
                style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="ativoCheck">Ativo</label>
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

