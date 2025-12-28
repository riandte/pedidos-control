import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export const createPixPayment = async (orderId: string, amount: number, payer: { email: string; firstName: string }) => {
  const payment = new Payment(client);

  try {
    const result = await payment.create({
      body: {
        transaction_amount: Number(amount.toFixed(2)),
        description: `Pedido #${orderId}`,
        payment_method_id: 'pix',
        payer: {
          email: payer.email,
          first_name: payer.firstName,
        },
        external_reference: orderId,
        notification_url: 'https://pedidos-control.vercel.app/api/webhook/mercadopago', // This needs to be a public URL
      },
    });

    return {
      id: result.id,
      status: result.status,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
    };
  } catch (error) {
    console.error('Erro ao criar pagamento Pix:', error);
    throw new Error('Falha ao gerar pagamento Pix');
  }
};

export const getPaymentStatus = async (paymentId: string) => {
    const payment = new Payment(client);
    try {
        const result = await payment.get({ id: paymentId });
        return result;
    } catch (error) {
        console.error('Erro ao buscar status do pagamento:', error);
        throw error;
    }
};

export const checkPaymentByOrder = async (orderId: string) => {
  const payment = new Payment(client);
  try {
    const result = await payment.search({
      options: {
        external_reference: orderId,
        limit: 1,
        sort: 'date_created',
        criteria: 'desc'
      }
    });
    
    if (result.results && result.results.length > 0) {
        return result.results[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar pagamento por referência:', error);
    return null;
  }
};
