import React from 'react';
import { X } from 'lucide-react';

interface Adicional {
  id: string;
  nomeAdicional: string;
  precoAdicional: number;
}

interface ItemPedido {
  id: string;
  quantidade: number;
  nomeProduto: string;
  observacao?: string;
  totalItem: number;
  adicionais?: Adicional[];
}

interface Pedido {
  id: string;
  numero?: number;
  nomeCliente: string;
  telefone?: string;
  tipoEntrega: string;
  total: number;
  observacao?: string;
  itens: ItemPedido[];
}

interface OrderDetailsModalProps {
  pedido: Pedido;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ pedido, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Detalhes do Pedido</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            <X size={24} />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Cliente</h3>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{pedido.nomeCliente}</p>
            {pedido.telefone && <p style={{ margin: '0.25rem 0 0', color: '#666' }}>{pedido.telefone}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Itens</h3>
            {(pedido.itens || []).map((item) => (
              <div key={item.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{item.quantidade}x {item.nomeProduto}</span>
                  <span>R$ {Number(item.totalItem).toFixed(2)}</span>
                </div>
                
                {item.adicionais && item.adicionais.length > 0 && (
                  <div style={{ marginLeft: '1rem', marginTop: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
                    {item.adicionais.map((ad, idx) => (
                      <div key={idx}>+ {ad.nomeAdicional}</div>
                    ))}
                  </div>
                )}
                
                {item.observacao && (
                  <div style={{ marginTop: '0.25rem', color: '#ef4444', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Obs: {item.observacao}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pedido.observacao && (
            <div style={{ marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Observação do Pedido</h3>
               <p style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '4px', color: '#991b1b' }}>
                 {pedido.observacao}
               </p>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem' }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
              R$ {Number(pedido.total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
