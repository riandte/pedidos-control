import { useEffect, useState, useCallback, CSSProperties } from 'react';
import { api } from '../../services/api';
import { OrderCard } from '../../components/OrderCard';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';
import { Loading } from '../../components/Loading';

interface PedidoAdmin {
  id: string;
  numero?: number;
  nomeCliente: string;
  tipoEntrega: string;
  status: 'RECEBIDO' | 'EM_PREPARO' | 'PRONTO' | 'FINALIZADO' | 'CANCELADO' | string;
  total: number;
  criadoEm: string;
  telefone?: string;
  observacao?: string;
  itens: {
    id: string;
    quantidade: number;
    nomeProduto: string;
    observacao?: string;
    totalItem: number;
    adicionais?: {
      id: string;
      nomeAdicional: string;
      precoAdicional: number;
    }[];
  }[];
}

export function AdminPedidos() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoAdmin | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchPedidos = useCallback(async () => {
    // Polling silencioso se já tiver dados
    // setLoading(true); 
    try {
      const res = await api.get('/admin/pedidos');
      if (Array.isArray(res.data)) {
        setPedidos(res.data);
      } else {
        console.error('Resposta inválida da API de pedidos:', res.data);
        setPedidos([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPedidos().finally(() => setLoading(false));
    
    const interval = setInterval(fetchPedidos, 8000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/pedidos/${id}/status`, { status: newStatus });
      fetchPedidos();
    } catch {
      alert('Erro ao atualizar status');
    }
  };

  const statuses: Array<{ key: 'RECEBIDO' | 'EM_PREPARO' | 'PRONTO', label: string, color: string, bg: string }> = [
    { key: 'RECEBIDO', label: 'Recebidos', color: '#d35400', bg: '#fff7ed' },
    { key: 'EM_PREPARO', label: 'Em Preparo', color: '#f1c40f', bg: '#fef9c3' },
    { key: 'PRONTO', label: 'Prontos', color: '#2ecc71', bg: '#dcfce7' },
  ];

  const nextStatus = (s: string) => {
    if (s === 'RECEBIDO') return 'EM_PREPARO';
    if (s === 'EM_PREPARO') return 'PRONTO';
    if (s === 'PRONTO') return 'FINALIZADO';
    return s;
  };

  const prevStatus = (s: string) => {
    if (s === 'EM_PREPARO') return 'RECEBIDO';
    if (s === 'PRONTO') return 'EM_PREPARO';
    if (s === 'FINALIZADO') return 'PRONTO';
    return s;
  };

  const kanbanContainer: CSSProperties = {
    display: 'flex',
    gap: isMobile ? '1rem' : '0.5rem',
    alignItems: 'flex-start',
    overflowX: isMobile ? 'auto' : 'hidden',
    overflowY: 'hidden',
    width: '100%',
    height: 'calc(100% - 60px)', // Remaining height after header
    scrollSnapType: isMobile ? 'x mandatory' : 'none',
    paddingBottom: isMobile ? '0.5rem' : 0
  };

  const columnStyle = (bg: string): CSSProperties => ({
    flex: isMobile ? '0 0 85vw' : 1,
    minWidth: 0, // Prevent overflow
    background: bg,
    borderRadius: 8,
    padding: isMobile ? '0.5rem' : '0.5rem',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    scrollSnapAlign: 'start'
  });

  const groupByStatus = (list: PedidoAdmin[]) => {
    return statuses.reduce<Record<string, PedidoAdmin[]>>((acc, s) => {
      acc[s.key] = list.filter(p => p.status === s.key);
      return acc;
    }, {});
  };

  const grouped = groupByStatus(pedidos);

  if (loading && pedidos.length === 0) {
    return <Loading fullScreen message="Buscando pedidos..." />;
  }

  return (
    <div style={{ height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Pedidos</h1>
        {loading && <span style={{ color: '#999' }}>Atualizando...</span>}
      </div>

      <div style={kanbanContainer}>
        {statuses.map(({ key, label, color, bg }) => (
          <div key={key} style={columnStyle(bg)} className="kanban-column">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '0.5rem',
              position: 'sticky',
              top: 0,
              background: bg,
              zIndex: 10,
              paddingBottom: '0.5rem',
              borderBottom: '2px solid rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontWeight: 'bold', color, fontSize: '1.1rem' }}>{label}</span>
              <span style={{ 
                background: color, 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.85rem',
                fontWeight: 'bold' 
              }}>
                {grouped[key]?.length || 0}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {(grouped[key] || []).map(pedido => (
                <OrderCard
                  key={pedido.id}
                  pedido={pedido}
                  onAdvance={(id) => handleStatusChange(id, nextStatus(pedido.status))}
                  onRevert={(id) => handleStatusChange(id, prevStatus(pedido.status))}
                  onCancel={(id) => handleStatusChange(id, 'CANCELADO')}
                  onViewDetails={setSelectedPedido}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPedido && (
        <OrderDetailsModal 
          pedido={selectedPedido} 
          onClose={() => setSelectedPedido(null)} 
        />
      )}
    </div>
  );
}
