import React, { useState, useEffect } from 'react';
import { ItemCarrinho, ResultadoCalculo } from '../types';
import { api } from '../services/api';

interface CartDrawerProps {
  cart: ItemCarrinho[];
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  storeOpen?: boolean;
}

interface PixData {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
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
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [verificando, setVerificando] = useState(false);
  
  // Polling para verificar status do pagamento
  useEffect(() => {
    let interval: any;

    if (step === 'PAYMENT' && pedidoId && pixData) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/payment/${pedidoId}/status`);
          if (res.data.statusPagamento === 'APROVADO') {
            clearInterval(interval);
            alert('Pagamento Confirmado! Seu pedido foi enviado para a cozinha. 🍔');
            onClose();
          }
        } catch (err) {
          console.error('Erro ao verificar status', err);
        }
      }, 3000); // Verifica a cada 3 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, pedidoId, pixData, onClose]);

  const handleVerificarPagamento = async () => {
    if (!pedidoId) return;
    setVerificando(true);
    try {
        const res = await api.get(`/payment/${pedidoId}/status`);
        if (res.data.statusPagamento === 'APROVADO') {
            alert('Pagamento Confirmado! Seu pedido foi enviado para a cozinha. 🍔');
            onClose();
        } else {
            alert('Pagamento ainda não confirmado. Se você já pagou, aguarde alguns segundos e tente novamente.');
        }
    } catch (err) {
        console.error('Erro ao verificar status', err);
        alert('Erro ao verificar status.');
    } finally {
        setVerificando(false);
    }
  };

  const getErrMessage = (err: unknown) => {
    if (typeof err === 'object' && err !== null) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      return e.response?.data?.message || e.message || 'Erro inesperado';
    }
    return 'Erro inesperado';
  };

  // 1. Simular Preço
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

  // 2. Criar Pedido e Gerar Pix
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
      // 1. Criar Pedido
      const res = await api.post('/pedidos', { 
        nomeCliente, 
        telefone: telefoneCliente,
        tipoEntrega,
        itens: cart 
      });
      const novoPedidoId = res.data.id;
      setPedidoId(novoPedidoId);
      
      // 2. Gerar Pix Real (Mercado Pago)
      const payRes = await api.post<PixData>('/payment/pix', { 
        pedidoId: novoPedidoId 
      });
      
      setPixData(payRes.data);
      setStep('PAYMENT');
      onClearCart(); // Limpa carrinho local pois pedido foi criado
    } catch (err: unknown) {
      setError(getErrMessage(err) || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>

        {/* Etapa de Pagamento */}
        {step === 'PAYMENT' && (
          <div className="payment-step">
             <h3>Pagamento via Pix</h3>
             <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>
               Escaneie o QR Code ou use o Copia e Cola. <br/>
               O pedido será liberado automaticamente após o pagamento.
             </p>
             
             <div className="payment-methods">
                <div className="pix-area">
                  {loading ? (
                    <p>Gerando Pix...</p>
                  ) : pixData ? (
                    <>
                      <div className="qrcode-mock">
                        {/* QR Code Real do Mercado Pago */}
                        {pixData.qr_code_base64 && (
                            <img 
                                src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                                alt="QR Code Pix" 
                                style={{ width: '200px', height: '200px', display: 'block', margin: '0 auto' }}
                            />
                        )}
                      </div>
                      
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Código Copia e Cola:</p>
                        <textarea 
                            readOnly
                            value={pixData.qr_code}
                            style={{ 
                                width: '100%', 
                                height: '80px', 
                                fontSize: '0.8rem', 
                                background: '#f8f9fa', 
                                padding: '0.5rem', 
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                resize: 'none'
                            }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                        <button 
                          className="copy-btn" 
                          onClick={() => {
                              navigator.clipboard.writeText(pixData.qr_code);
                              alert('Código copiado!');
                          }}
                          style={{ flex: 1 }}
                        >
                          Copiar Código
                        </button>
                        <button
                            className="check-btn"
                            onClick={handleVerificarPagamento}
                            disabled={verificando}
                            style={{ 
                                flex: 1, 
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontWeight: 600,
                                opacity: verificando ? 0.7 : 1
                            }}
                        >
                            {verificando ? 'Verificando...' : 'Já Paguei'}
                        </button>
                      </div>

                      <div className="loading-spinner" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            border: '3px solid #f3f3f3', 
                            borderTop: '3px solid #3498db', 
                            borderRadius: '50%', 
                            animation: 'spin 1s linear infinite' 
                        }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Aguardando pagamento...</p>
                        
                        {window.location.hostname === 'localhost' && (
                           <button 
                             onClick={async () => {
                               if(!pixData) return;
                               // Simula webhook chamando o backend (hack para dev local)
                               // Na verdade, o ideal seria ter um endpoint de "forçar status" em dev, 
                               // mas como não criamos, vamos apenas esperar o usuário pagar de verdade ou implementar o webhook mock se quiser.
                               // Como removemos o webhook mock, vamos apenas avisar.
                               alert('Em localhost o Webhook do Mercado Pago não chega.\nPara testar o fluxo completo, use o Ngrok ou faça deploy.');
                             }}
                             style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#999', background: 'none', border: '1px dashed #ccc', padding: '2px 5px', cursor: 'pointer' }}
                           >
                             (Dev: O Webhook não funciona em Localhost)
                           </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: 'red' }}>Erro ao gerar Pix. Tente novamente.</p>
                  )}
                </div>
             </div>
          </div>
        )}
        
        {/* Etapa de Revisão */}
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

      {/* Etapa de Identificação */}
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
               {loading ? 'Processando...' : 'Gerar Pagamento PIX'}
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
