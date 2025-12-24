import React, { useState } from 'react';
import { ItemCarrinho, ResultadoCalculo } from '../types';
import { api } from '../services/api';

interface CartDrawerProps {
  cart: ItemCarrinho[];
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  storeOpen?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ cart, onClose, onRemoveItem, onClearCart, storeOpen = true }) => {
  const [step, setStep] = useState<'REVIEW' | 'NAME' | 'PAYMENT'>('REVIEW');
  const [simulation, setSimulation] = useState<ResultadoCalculo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'RETIRADA' | 'ENTREGA' | 'MESA'>('RETIRADA');
  const [pedidoId, setPedidoId] = useState('');
  interface PixData { pagamentoId: string; pix: { qrCodeUrl: string; copiaCola: string } }
  const [pixData, setPixData] = useState<PixData | null>(null);
  
  const getErrMessage = (err: unknown) => {
    if (typeof err === 'object' && err !== null) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return e.response?.data?.message || e.message || 'Erro inesperado';
    }
    return 'Erro inesperado';
  };

  // 1. Simular Preço (Backend is Truth)
  const handleSimular = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/carrinho/simular', { itens: cart });
      setSimulation(res.data);
      setStep('NAME');
    } catch (err: unknown) {
      console.error(err);
      setError(getErrMessage(err) || 'Erro ao calcular carrinho');
    } finally {
      setLoading(false);
    }
  };

  // 2. Criar Pedido
  const handleCriarPedido = async () => {
    if (!nomeCliente) {
      setError('Nome é obrigatório');
      return;
    }
    if (!telefoneCliente) {
      setError('Telefone é obrigatório');
      return;
    }
    setLoading(true);
    try {
      // Create Order
      const res = await api.post('/pedidos', { 
        nomeCliente, 
        telefone: telefoneCliente,
        tipoEntrega,
        itens: cart 
      });
      setPedidoId(res.data.id);
      
      // Auto-start payment (Mock PIX)
      const payRes = await api.post<PixData>('/pagamentos/iniciar', { 
        pedidoId: res.data.id, 
        metodo: 'PIX' 
      });
      setPixData(payRes.data);
      setStep('PAYMENT');
      onClearCart(); // Clear local cart as order is created
    } catch (err: unknown) {
      setError(getErrMessage(err) || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  // 3. Simular Pagamento (Webhook Mock)
  const handleMockPagamento = async () => {
     if (!pixData) return;
     setLoading(true);
     try {
       await api.post('/pagamentos/webhook-mock', { 
         pagamentoId: pixData.pagamentoId, 
         pedidoId: pedidoId, // Added pedidoId to help backend update status
         status: 'APROVADO' 
       });
       alert('Pagamento Aprovado! Pedido em Preparo.');
       onClose();
     } catch (err: unknown) {
       setError(getErrMessage(err));
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>

        {/* Payment Step */}
        {step === 'PAYMENT' && (
          <div className="payment-step">
             <h3>Pagamento</h3>
             
             <div className="payment-methods">
                <div className="pix-area">
                  <h4>Pix (Copia e Cola)</h4>
                  {loading ? (
                    <p>Gerando Pix...</p>
                  ) : pixData ? (
                    <>
                      <div className="qrcode-mock">
                        {/* In a real app, render QR Code here */}
                        <div style={{ background: '#f0f0f0', width: '200px', height: '200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          QR CODE
                        </div>
                      </div>
                      <p style={{ wordBreak: 'break-all', fontSize: '0.8rem', background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
                        {pixData.pix.copiaCola}
                      </p>
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(pixData.pix.copiaCola)}>
                        Copiar Código
                      </button>
                    </>
                  ) : (
                    <p>Erro ao gerar Pix</p>
                  )}
                </div>

                <div className="divider">ou</div>

                <button className="finalize-btn" onClick={handleMockPagamento} disabled={loading}>
                   {loading ? 'Processando...' : 'Pagar na Entrega'}
                </button>
             </div>
          </div>
        )}
        
        {step === 'REVIEW' && (
          <>
            <h2>Seu Pedido</h2>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                <p>Sua sacola está vazia 🛍️</p>
              </div>
            ) : (
              <div className="item-list">
                {cart.map((item, idx) => (
                  <div key={idx} className="item-card">
                    <div className="item-info">
                      <h3>{item.quantidade}x {item.nomeProduto}</h3>
                      <p className="item-desc">{item.descricaoAdicionais}</p>
                      {item.observacao && <p className="item-desc" style={{ fontStyle: 'italic' }}>Obs: {item.observacao}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                       <span className="item-price">R$ {item.precoTotalEstimado.toFixed(2)}</span>
                       <button 
                        onClick={() => onRemoveItem(idx)} 
                        style={{ 
                          color: '#ef4444', 
                          border: 'none', 
                          background: 'none', 
                          cursor: 'pointer', 
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {error && <p className="error-msg">{error}</p>}
            
            {cart.length > 0 && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              {!storeOpen ? (
                 <div className="store-closed-msg">
                   A loja está fechada no momento 🌙
                 </div>
              ) : (
                <button className="add-btn" onClick={handleSimular} disabled={loading}>
                  {loading ? 'Calculando...' : 'Confirmar Pedido'}
                </button>
              )}
            </div>
          )}
        </>
      )}

        {step === 'NAME' && simulation && (
           <>
             <h2>Finalizar Pedido</h2>
             
             <div style={{ 
               background: '#f8fafc', 
               padding: '1rem', 
               borderRadius: '12px',
               marginBottom: '1.5rem',
               border: '1px solid #e2e8f0'
             }}>
               <div className="summary-row">
                 <span>Subtotal</span>
                 <span>R$ {Number(simulation.total).toFixed(2)}</span>
               </div>
               <div className="summary-total">
                 <span>Total</span>
                 <span>R$ {Number(simulation.total).toFixed(2)}</span>
               </div>
             </div>
             
             <div>
               <label className="form-label">Seu Nome</label>
               <input 
                 className="form-input"
                 type="text" 
                 value={nomeCliente} 
                 onChange={e => setNomeCliente(e.target.value)}
                 placeholder="Como gostaria de ser chamado?"
               />

               <label className="form-label">Seu Telefone</label>
               <input 
                 className="form-input"
                 type="text" 
                 value={telefoneCliente} 
                 onChange={e => setTelefoneCliente(e.target.value)}
                 placeholder="(00) 90000-0000"
               />

               <label className="form-label">Tipo de Entrega</label>
               <select
                 className="form-input"
                 value={tipoEntrega}
                 onChange={e => setTipoEntrega(e.target.value as 'RETIRADA' | 'ENTREGA' | 'MESA')}
               >
                 <option value="RETIRADA">Retirada no Balcão</option>
                 <option value="ENTREGA">Entrega (Delivery)</option>
                 <option value="MESA">Comer na Mesa</option>
               </select>
             </div>

             {error && <p className="error-msg">{error}</p>}

             <button className="add-btn" onClick={handleCriarPedido} disabled={loading}>
               {loading ? 'Enviando...' : 'Ir para Pagamento (PIX)'}
             </button>
             <button className="checkout-btn" onClick={() => setStep('REVIEW')}>
               Voltar
             </button>
           </>
        )}
      </div>
    </div>
  );
};
