export interface Adicional {
  id: string;
  nome: string;
  preco: number | string;
  grupoId: string;
  // imagemUrl? removed as it's not in schema explicitly, but maybe needed for UI? 
  // Schema doesn't have imagemUrl for Adicional. 
}

export interface GrupoAdicional {
  id: string;
  nome: string;
  minEscolhas: number;
  maxEscolhas: number;
  adicionais: Adicional[];
}

export interface Ingrediente {
  id: string;
  nome: string;
  // unidade: string; // Not in schema anymore
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  precoBase: number | string;
  categoriaId: string;
  imagemUrl?: string;
  permiteAdicionais: boolean;
  tempoPreparoMin?: number;
  gruposAdicionais?: GrupoAdicional[];
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  produtos?: Produto[]; // Was itens
}

export interface ItemCarrinho {
  produtoId: string; // Was itemId
  quantidade: number;
  observacao?: string;
  adicionais: { // Was modificadores
    grupoId: string; // Was modificadorId
    adicionaisId: string[]; // Was opcoesId
  }[];
  // Campos auxiliares para UI
  tempId: string;
  nomeProduto: string; // Was nomeItem
  precoTotalEstimado: number;
  descricaoAdicionais: string; // Was descricaoModificadores
}

// For API responses if needed
export interface Config {
  nomeLoja: string;
  endereco: string;
  horario: string;
  mensagem: string;
  aberto: boolean;
}

export interface ResultadoCalculo {
  total: number;
  subtotal: number;
  itens: {
    produtoId: string;
    nome: string;
    quantidade: number;
    totalItem: number;
    adicionais: {
      nome: string;
      preco: number;
    }[];
  }[];
}
