import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface PedidoKDS {
  id: string;
  ticket: number;
  cliente: string;
  tempoEspera: string;
  itens: {
    qtd: number;
    nome: string;
    obs?: string;
    adicionais: string;
  }[];
}

export function KDS() {
  const [pedidos, setPedidos] = useState<PedidoKDS[]>([]);

  const fetchKDS = async () => {
    try {
      const res = await api.get('/kds/fila');
      setPedidos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKDS();
    const interval = setInterval(fetchKDS, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePronto = async (id: string) => {
    try {
      await api.patch(`/kds/pedidos/${id}/pronto`);
      fetchKDS(); // Refresh immediately
    } catch (err) {
      alert('Erro ao marcar como pronto');
    }
  };

  return (
    <div style={{ background: '#2c3e50', minHeight: '100vh', padding: '1rem', color: 'white' }}>
      <header style={{ borderBottom: '1px solid #7f8c8d', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>KDS - Cozinha</h1>
        <span>{pedidos.length} pedidos em fila</span>
      </header>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {pedidos.length === 0 ? (
          <p style={{ opacity: 0.5 }}>Nenhum pedido em preparo...</p>
        ) : (
          pedidos.map(pedido => (
            <div key={pedido.id} style={{ 
              background: 'white', 
              color: '#333', 
              minWidth: '300px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ background: '#f1c40f', padding: '0.5rem 1rem' }}>
                <h3 style={{ margin: 0 }}>#{pedido.ticket} - {pedido.cliente}</h3>
                <small>{new Date(pedido.tempoEspera).toLocaleTimeString()}</small>
              </div>

              <div style={{ padding: '1rem', flex: 1 }}>
                {pedido.itens.map(item => (
                  <div key={item.nome} style={{ marginBottom: '0.8rem', borderBottom: '1px dashed #eee', paddingBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {item.qtd}x {item.nome}
                    </div>
                    {item.obs && (
                      <div style={{ background: '#ffeba7', padding: '4px', borderRadius: '4px', marginTop: '4px' }}>
                        ⚠️ {item.obs}
                      </div>
                    )}
                    {item.adicionais && (
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {item.adicionais}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePronto(pedido.id)}
                style={{ 
                  background: '#2ecc71', 
                  color: 'white', 
                  border: 'none', 
                  padding: '1rem', 
                  fontSize: '1.2rem', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                PRONTO ✅
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
