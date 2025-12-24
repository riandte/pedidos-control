import React from 'react';
import { ArrowRight, ArrowLeft, X, Printer } from 'lucide-react';

interface Pedido {
  id: string;
  numero?: number;
  nomeCliente: string;
  telefone?: string;
  tipoEntrega: string;
  total: number;
  status: string;
  criadoEm: string;
  observacao?: string;
  itens: any[];
}

interface OrderCardProps {
  pedido: Pedido;
  onAdvance: (id: string) => void;
  onRevert: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (pedido: Pedido) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  pedido, 
  onAdvance, 
  onRevert, 
  onCancel, 
  onViewDetails 
}) => {
  const isFirstStep = pedido.status === 'RECEBIDO';
  
  const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
      onCancel(pedido.id);
    }
  };

  const handlePrint = () => {
    // Placeholder for printing functionality
    window.print();
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '0.75rem', // Reduced padding
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.5rem',
      border: '1px solid #e5e7eb',
      minHeight: '100px', // Ensure consistent height
      transition: 'box-shadow 0.2s',
    }}>
      {/* Left Content */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, overflow: 'hidden' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '800', color: '#1f2937' }}>
            PEDIDO: {pedido.numero ? `#${pedido.numero}` : `#${pedido.id.slice(0, 4)}`}
          </h3>
          
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16a34a', marginBottom: '0.25rem' }}>
            Total: R$ {Number(pedido.total).toFixed(2)}
          </div>
          
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: '#4b5563', 
            textTransform: 'uppercase',
            background: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px',
            width: 'fit-content',
            marginBottom: '0.5rem'
          }}>
            {pedido.tipoEntrega}
          </div>
        </div>

        <button 
          onClick={() => onViewDetails(pedido)}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.4rem 0.8rem',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            cursor: 'pointer',
            width: 'fit-content',
            transition: 'background 0.2s'
          }}
        >
          DETALHES
        </button>
      </div>

      {/* Right Actions (Vertical Column) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        gap: '0.25rem',
        paddingLeft: '0.5rem',
        borderLeft: '1px solid #f3f4f6'
      }}>
        {/* Advance */}
        <button
          onClick={() => onAdvance(pedido.id)}
          title="Avançar Status"
          style={{
            background: 'transparent',
            color: '#16a34a', // Green
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowRight size={22} strokeWidth={2.5} />
        </button>

        {/* Revert */}
        <button
          onClick={() => onRevert(pedido.id)}
          disabled={isFirstStep}
          title="Voltar Status"
          style={{
            background: 'transparent',
            color: isFirstStep ? '#d1d5db' : '#f97316', // Orange
            border: 'none',
            cursor: isFirstStep ? 'not-allowed' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => !isFirstStep && (e.currentTarget.style.background = '#ffedd5')}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          title="Imprimir"
          style={{
            background: 'transparent',
            color: '#4b5563', // Gray/Blueish
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Printer size={20} strokeWidth={2.5} />
        </button>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          title="Cancelar Pedido"
          style={{
            background: 'transparent',
            color: '#ef4444', // Red
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <X size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
