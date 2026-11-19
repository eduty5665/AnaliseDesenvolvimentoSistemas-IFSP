// src/types/index.ts

export type Role = 'CIDADAO' | 'FUNCIONARIO' | 'ADMIN_LOCAL' | 'GLOBAL';

export type StatusRequisicao = 
  | 'SOLICITADO' 
  | 'APROVADO' 
  | 'RECUSADO' 
  | 'AGUARDANDO_RETIRADA' 
  | 'AGENDADO_PLANTIO' 
  | 'CONCLUIDO';

export type TipoAtendimento = 'RETIRADA_LOCAL' | 'PLANTIO_AGENDADO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  role: Role;
  cidadeId?: string | null;
  cidade?: Cidade;
  criadoEm: string; // No JSON da API, datas costumam vir como string ISO
  atualizadoEm: string;
  ativo: boolean;
}

export interface Arvore {
  id: string;
  cidadeId?: string | null;
  cidade?: Cidade;
  nomePopular: string;
  descricao?: string | null;
  imagemUrl?: string | null;
  quantidade: number;
  ativa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Requisicao {
  id: string;
  criadoPorId: string;
  cidadao?: Usuario;
  cidadeId: string;
  cidade?: Cidade;
  arvoreId: string;
  arvore?: Arvore;
  status: StatusRequisicao;
  observacaoStatus?: string | null; //OBS caso req seja negada 
  nomeBeneficiario: string;
  telefoneBeneficiario: string;
  emailBeneficiario: string;
  tipoAtendimento: TipoAtendimento;
  enderecoId?: string; //Caso de tipoAtendimento for retirada
  endereco?: Endereco;
  rua: string;
  numero: string;
  bairro: string;
  cidadeEndereco: string;
  cep: string;
  estado: string;
  pontoReferencia?: string | null;
  fotoLocalUrl?: string | null;
  comprovanteResidenciaUrl?: string | null;
  fotoPlantioUrl?: string | null;
  criadoEm: string;
  atualizadoEm: string;

  historico: {
    statusAnterior: StatusRequisicao;
    statusNovo: StatusRequisicao;
    observacao?: string;
    criadoEm: string;
  }[];
  
  dataInicial?: string | null;
  dataFinal?: string | null;
  
}

export interface Cidade {
  id: string;
  nome: string;
  uf: string;
  usuarios?: Usuario[];       // Opcional, caso a rota traga os usuários
  requisicoes?: Requisicao[]; // Opcional, caso a rota traga as requisições
  arvores?: Arvore[];         // Opcional, caso a rota traga as árvores
  criadoEm: string;
  atualizadoEm: string;
  ativa: boolean;
  permiteEntrega: boolean;
}

export interface Endereco {
  id: string;
  rua: string;
  numero: string;
  bairro: string;
  cep?: string;
  pontoReferencia?: string;
  cidadeId: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Publicacao {
  id: string;
  idRequisicao: string;
  titulo: string;
  descricao: string;
  criadoEm: string;

  requisicao?: {
    nomeBeneficiario: string | null;
    fotoPlantioUrl: string | null;
  };
}

export interface CursorPublicacao {
  cursorDate: string;
  cursorId: string;
}

export interface RespostaPublicacoes {
  items: Publicacao[];
  nextCursor: CursorPublicacao | null;
  hasMore: boolean;
}