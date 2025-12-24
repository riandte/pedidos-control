import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Save } from 'lucide-react';

export function AdminConfiguracoes() {
  const [formData, setFormData] = useState({
    nomeLoja: '',
    endereco: '',
    horario: '',
    mensagem: '',
    aberto: true
  });
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/configuracoes');
      if (res.data) {
          setFormData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/configuracoes', formData);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar');
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <PageHeader title="Configurações do Sistema" />
      
      {loading ? <p>Carregando...</p> : (
        <form onSubmit={handleSave} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input 
                    label="Nome da Loja"
                    value={formData.nomeLoja} 
                    onChange={e => setFormData({...formData, nomeLoja: e.target.value})}
                    required
                />

                <Input 
                    label="Horário de Funcionamento"
                    value={formData.horario} 
                    onChange={e => setFormData({...formData, horario: e.target.value})}
                    placeholder="Ex: 18:00 às 23:00"
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <Input 
                    label="Endereço Exibido"
                    value={formData.endereco} 
                    onChange={e => setFormData({...formData, endereco: e.target.value})}
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem', color: '#333' }}>Mensagem Personalizada (ex: Promoções)</label>
                <textarea 
                    value={formData.mensagem || ''} 
                    onChange={e => setFormData({...formData, mensagem: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', height: '80px', boxSizing: 'border-box' }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem', background: formData.aberto ? '#dcfce7' : '#fee2e2', padding: '1rem', borderRadius: '6px', border: `1px solid ${formData.aberto ? '#86efac' : '#fca5a5'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="checkbox" 
                        id="abertoCheck"
                        checked={formData.aberto} 
                        onChange={e => setFormData({...formData, aberto: e.target.checked})}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="abertoCheck" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: formData.aberto ? '#166534' : '#991b1b' }}>
                        {formData.aberto ? '✅ ESTABELECIMENTO ABERTO' : '⛔ ESTABELECIMENTO FECHADO'}
                    </label>
                </div>
                <small style={{ display: 'block', marginTop: '5px', color: '#555' }}>
                    Se desmarcado, os clientes verão a mensagem de "Fechado" e não conseguirão fazer pedidos.
                </small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" size="lg">
                    <Save size={20} /> Salvar Configurações
                </Button>
            </div>
        </form>
      )}
    </div>
  );
}

