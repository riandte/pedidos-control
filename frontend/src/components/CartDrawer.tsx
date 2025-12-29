import React, { useState, useEffect } from 'react';
import { ItemCarrinho } from '../types';
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
  const [step, setStep] = useState<'REVIEW' | 'AUTH' | 'PAYMENT'>('REVIEW');
  const [phoneChecked, setPhoneChecked] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [endereco, setEndereco] = useState('');
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

  const handleCheckPhone = async () => {
    if (!telefoneCliente || telefoneCliente.length < 10) {
        setError('Digite um telefone válido (com DDD).');
        return;
    }
    setLoading(true);
    setError('');
    try {
        const res = await api.post('/auth/check-phone', { telefone: telefoneCliente });
        if (res.data.exists) {
            setNomeCliente(res.data.user.nome);
            if (res.data.user.endereco) setEndereco(res.data.user.endereco);
        } else {
            setError('Usuário não encontrado. Digite seu nome para cadastrar.');
        }
        setPhoneChecked(true);
    } catch (err: unknown) {
        setError('Erro ao verificar telefone');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleCriarPedido = async () => {
    if (!nomeCliente) {
      setError('Nome é obrigatório');
      return;
    }
    if (tipoEntrega === 'ENTREGA' && !endereco) {
      setError('Endereço é obrigatório para entrega');
      return;
    }
    if (!telefoneCliente) {
      setError('Telefone é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Autenticação Silenciosa (Cria ou Atualiza usuário e pega Token)
      const authRes = await api.post('/auth/phone-auth', { 
        telefone: telefoneCliente, 
        nome: nomeCliente, 
        endereco: tipoEntrega === 'ENTREGA' ? endereco : undefined 
      });
      
      const { token } = authRes.data;

      // 2. Cria o Pedido (usando o token do cliente)
      const res = await api.post('/pedidos', { 
        nomeCliente, 
        telefone: telefoneCliente,
        tipoEntrega,
        endereco: tipoEntrega === 'ENTREGA' ? endereco : undefined,
        itens: cart 
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const novoPedidoId = res.data.id;
      setPedidoId(novoPedidoId);

      // 3. Gera Pix
      const payRes = await api.post<PixData>('/payment/pix', { 
        pedidoId: novoPedidoId 
      });
      
      setPixData(payRes.data);
      setStep('PAYMENT');
      onClearCart();
      
    } catch (err: unknown) {
      setError(getErrMessage(err) || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((acc, item) => acc + item.precoTotalEstimado, 0);

  if (!storeOpen) {
     return (
        <div className="cart-drawer-overlay" onClick={onClose}>
           <div className="cart-drawer" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={onClose}>&times;</button>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                 <h2>Loja Fechada 🌙</h2>
                 <p>Estamos fechados no momento. Confira nosso horário de funcionamento.</p>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {/* Etapa de Pagamento (QR Code) */}
        {step === 'PAYMENT' && pixData && (
          <div className="payment-step">
             <h2>Pagamento via Pix</h2>
             <div className="qr-container">
                <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" style={{ width: '100%', maxWidth: '250px' }} />
                
                <div style={{ margin: '1rem 0' }}>
                   <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Código Pix Copia e Cola:</p>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" value={pixData.qr_code} readOnly className="form-input" style={{ fontSize: '0.8rem' }} />
                      <button 
                        onClick={() => navigator.clipboard.writeText(pixData.qr_code)}
                        style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                      >
                        Copiar
                      </button>
                   </div>
                </div>

                <div className="status-payment">
                  {verificando ? (
                      <p style={{ color: '#f59e0b' }}>Verificando pagamento...</p>
                  ) : (
                    <>
                      <p>Aguardando confirmação...</p>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <button className="add-btn" onClick={handleVerificarPagamento}>
                            Já paguei
                        </button>
                        
                        {/* Botão de Hack para Localhost (Se quiser manter para testes) */}
                        {window.location.hostname === 'localhost' && (
                           <button 
                             onClick={async () => {
                               if(!pixData) return;
                               alert('Em localhost o Webhook do Mercado Pago não chega.\nPara testar o fluxo completo, use o Ngrok ou faça deploy.');
                             }}
                             style={{ fontSize: '0.7rem', color: '#999', background: 'none', border: '1px dashed #ccc', padding: '5px 10px', cursor: 'pointer' }}
                           >
                             (Dev: Info Webhook)
                           </button>
                        )}
                      </div>
                    </>
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
                <p>Seu carrinho está vazio 😢</p>
                <button className="add-btn" onClick={onClose} style={{ marginTop: '1rem' }}>
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-header">
                        <span className="item-qty">{item.quantidade}x</span>
                        <span className="item-name">{item.nomeProduto}</span>
                        <button className="remove-btn" onClick={() => onRemoveItem(index)}>
                            Remover
                        </button>
                      </div>
                      {item.descricaoAdicionais && (
                         <p className="item-obs">+ {item.descricaoAdicionais}</p>
                      )}
                      {item.observacao && (
                        <p className="item-obs">Obs: {item.observacao}</p>
                      )}
                      <div className="item-price">
                        R$ {item.precoTotalEstimado.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="total-row">
                    <span>Total Estimado:</span>
                    <span className="total-value">R$ {total.toFixed(2)}</span>
                  </div>
                  
                  <div className="delivery-toggle" style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                     <button 
                        className={`toggle-btn ${tipoEntrega === 'RETIRADA' ? 'active' : ''}`}
                        onClick={() => setTipoEntrega('RETIRADA')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', background: tipoEntrega === 'RETIRADA' ? '#3b82f6' : 'white', color: tipoEntrega === 'RETIRADA' ? 'white' : 'black' }}
                     >
                        Retirada
                     </button>
                     <button 
                        className={`toggle-btn ${tipoEntrega === 'ENTREGA' ? 'active' : ''}`}
                        onClick={() => setTipoEntrega('ENTREGA')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', background: tipoEntrega === 'ENTREGA' ? '#3b82f6' : 'white', color: tipoEntrega === 'ENTREGA' ? 'white' : 'black' }}
                     >
                        Entrega
                     </button>
                  </div>

                  <button className="checkout-btn" onClick={() => setStep('AUTH')}>
                    Finalizar Pedido
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Etapa de Identificação (Nova Lógica Simplificada) */}
        {step === 'AUTH' && (
            <div className="auth-step">
               <h2>Identificação</h2>
               <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Informe seus dados para continuar.
               </p>
               
               {/* Campo de Telefone */}
               <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                   <label className="form-label" style={{ textAlign: 'center' }}>Celular com DDD</label>
                   <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                       <input 
                          className="form-input"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={telefoneCliente}
                          onChange={e => {
                              setTelefoneCliente(e.target.value);
                              setPhoneChecked(false); 
                              setNomeCliente('');
                          }}
                          disabled={loading}
                          style={{ textAlign: 'center' }}
                       />
                       {!phoneChecked && (
                           <button 
                             onClick={handleCheckPhone} 
                             disabled={loading || telefoneCliente.length < 10}
                             style={{ padding: '0 1rem', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                           >
                             OK
                           </button>
                       )}
                   </div>
               </div>

               {/* Campo Nome (Sempre visível) */}
               <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                   <label className="form-label" style={{ textAlign: 'center' }}>Seu Nome</label>
                   <input 
                      className="form-input"
                      type="text"
                      placeholder="Como podemos te chamar?"
                      value={nomeCliente}
                      onChange={e => setNomeCliente(e.target.value)}
                      disabled={loading}
                      style={{ textAlign: 'center' }}
                   />
               </div>

               {/* Campo Endereço (Aparece se Entrega) */}
               {tipoEntrega === 'ENTREGA' && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <label className="form-label" style={{ textAlign: 'center' }}>Endereço Completo</label>
                      <textarea 
                        className="form-input"
                        placeholder="Rua, Número, Bairro e Complemento"
                        value={endereco}
                        onChange={e => setEndereco(e.target.value)}
                        disabled={loading}
                        style={{ height: '80px', resize: 'none', textAlign: 'center' }}
                      />
                  </div>
               )}

               {error && (
                  <div className="error-msg">
                    {error}
                  </div>
               )}

               <div style={{ marginTop: '2rem' }}>
                  <button 
                    className="add-btn" 
                    onClick={handleCriarPedido}
                    disabled={loading || !nomeCliente || !telefoneCliente || (tipoEntrega === 'ENTREGA' && !endereco)}
                  >
                    {loading ? 'Processando...' : 'Confirmar e Pagar'}
                  </button>
                  <button 
                    onClick={() => setStep('REVIEW')}
                    style={{ 
                        width: '100%', 
                        background: 'none', 
                        border: 'none', 
                        color: '#64748b', 
                        padding: '1rem', 
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                    }}
                  >
                    Voltar
                  </button>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};
