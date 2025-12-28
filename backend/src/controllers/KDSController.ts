import { Request, Response } from 'express';
import { KDSService } from '../services/KDSService';

export class KDSController {
  private service = new KDSService();

  index = async (req: Request, res: Response) => {
    // Só busca pedidos com pagamento APROVADO ou que não sejam Pix (ex: dinheiro na entrega se houver)
    // Mas para o fluxo Pix, deve ser statusPagamento='APROVADO'
    // E status do pedido diferente de 'FINALIZADO', 'CANCELADO', 'AGUARDANDO_PAGAMENTO'
    const fila = await this.service.getFila();
    
    // Filtra na memória ou ajusta no Service (melhor no Service, mas aqui é rápido)
    const filaFiltrada = fila.filter(p => 
      p.status !== 'AGUARDANDO_PAGAMENTO' && 
      p.statusPagamento === 'APROVADO'
    );
    
    // Mapeamento para garantir formato limpo para tela (Frontend Friendly)
    const filaFormatada = filaFiltrada.map(p => ({
      id: p.id,
      ticket: p.numero, // Identificador curto visual
      cliente: p.nomeCliente,
      tempoEspera: p.createdAt, // Frontend calcula "há X min"
      itens: p.itens.map(i => ({
        qtd: i.quantidade,
        nome: i.nomeProduto,
        obs: i.observacao,
        adicionais: i.adicionais.map(o => o.nomeAdicional).join(', ') // String única para economizar espaço
      }))
    }));

    res.json(filaFormatada);
  };

  marcarPronto = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await this.service.marcarComoPronto(id);
      res.status(200).json({ message: 'Pedido marcado como PRONTO' }); // Retorno simples
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
