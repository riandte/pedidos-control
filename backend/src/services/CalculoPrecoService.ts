import prisma from '../config/database';

// Input vindo do Controller (DTO)
export interface ItemCarrinhoDTO {
  produtoId: string;
  quantidade: number;
  observacao?: string;
  adicionais: string[] | { grupoId: string; adicionaisId: string[] }[]; // aceita lista flat ou agrupada
}

// Resultado do cálculo (Snapshot seguro)
export interface ResultadoCalculo {
  total: number;
  subtotal: number; // Sem taxas/descontos
  itens: {
    produtoId: string;
    nome: string;
    quantidade: number;
    precoUnitarioBase: number;
    totalItem: number; // (base + adicionais) * quantidade
    observacao?: string; // Passado do input para persistência
    adicionais: {
      adicionalId: string;
      nome: string;
      preco: number;
    }[];
    erros: string[]; // Validações (ex: min/max selections violados)
  }[];
}

export class CalculoPrecoService {
  async calcular(itens: ItemCarrinhoDTO[]): Promise<ResultadoCalculo> {
    const resultado: ResultadoCalculo = {
      total: 0,
      subtotal: 0,
      itens: [],
    };

    // Busca todos os itens e seus modificadores/opções do banco para garantir integridade
    for (const itemInput of itens) {
      const produtoDb = await prisma.produto.findUnique({
        where: { id: itemInput.produtoId },
        include: {
          gruposAdicionais: {
            include: {
              adicionais: true,
            },
          },
        },
      });

      if (!produtoDb) {
        throw new Error(`Produto não encontrado: ${itemInput.produtoId}`);
      }

      const precoBase = Number(produtoDb.precoBase);
      let valorUnitarioTotal = precoBase;
      const adicionaisSelecionadosSnapshot: any[] = [];
      const errosItem: string[] = [];

      // Processar Adicionais
      let idsAdicionaisSolicitados: string[] = [];
      if (Array.isArray(itemInput.adicionais)) {
        const first = (itemInput.adicionais as any[])[0];
        if (typeof first === 'string') {
          idsAdicionaisSolicitados = itemInput.adicionais as string[];
        } else {
          // agrupado por grupoId/adicionaisId
          idsAdicionaisSolicitados = (itemInput.adicionais as { grupoId: string; adicionaisId: string[] }[])
            .flatMap(g => g.adicionaisId);
        }
      }

      if (idsAdicionaisSolicitados.length > 0) {
        if (!produtoDb.permiteAdicionais) {
           errosItem.push(`O produto ${produtoDb.nome} não aceita adicionais.`);
        } else {
           // Validar Grupos
           for (const grupo of produtoDb.gruposAdicionais) {
             const adicionaisDoGrupo = grupo.adicionais.filter(a => idsAdicionaisSolicitados.includes(a.id));
             
             // Validação Min/Max
             if (adicionaisDoGrupo.length < grupo.minEscolhas) {
               errosItem.push(
                 `Selecione pelo menos ${grupo.minEscolhas} opções em ${grupo.nome}`
               );
             }
             if (adicionaisDoGrupo.length > grupo.maxEscolhas) {
               errosItem.push(
                 `Selecione no máximo ${grupo.maxEscolhas} opções em ${grupo.nome}`
               );
             }

             // Somar preços
             for (const ad of adicionaisDoGrupo) {
               const precoAd = Number(ad.preco);
               valorUnitarioTotal += precoAd;
               adicionaisSelecionadosSnapshot.push({
                 adicionalId: ad.id,
                 nome: ad.nome,
                 preco: precoAd,
               });
             }
           }
           
           // TODO: Validar se existem adicionais solicitados que NÃO pertencem a nenhum grupo deste produto (fraude)
           // Por simplicidade do MVP, assumimos que o frontend envia correto ou ignoramos os extras inválidos não somados.
        }
      }

      const totalItem = valorUnitarioTotal * itemInput.quantidade;

      resultado.itens.push({
        produtoId: produtoDb.id,
        nome: produtoDb.nome,
        quantidade: itemInput.quantidade,
        precoUnitarioBase: precoBase,
        totalItem: totalItem,
        observacao: itemInput.observacao,
        adicionais: adicionaisSelecionadosSnapshot,
        erros: errosItem,
      });

      resultado.subtotal += totalItem;
    }

    resultado.total = resultado.subtotal;

    return resultado;
  }
}
