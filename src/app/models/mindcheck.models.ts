export type RiscoLevel = 'BAIXO' | 'MODERADO' | 'ALTO' | string;

export interface MindCheckAiRequest {
  usuarioId: number | null;
  relato: string;
  sintomas?: string;
  humor?: string;
  rotina?: string;
}

export interface MindCheckAiResponse {
  risco?: RiscoLevel;
  sugestoes?: string[];
  encaminhamentos?: string[];
  justificativa?: string;
  triagem?: TriagemResponse;
  encaminhamento?: EncaminhamentoResponse;
  encaminhamentosCriados?: EncaminhamentoResponse[];
}

export interface TriagemResponse {
  id?: number;
  dataHora?: string;
  relato?: string;
  risco?: RiscoLevel;
  sugestao?: string;
  usuario?: UsuarioResponse;
}

export interface EncaminhamentoResponse {
  id?: number;
  tipo?: string;
  exame?: string;
  especialidade?: string;
  prioridade?: string;
  status?: string;
  observacao?: string;
  triagem?: TriagemResponse;
  profissional?: ProfissionalResponse;
}

export interface EmpresaResponse {
  id?: number;
  nome?: string;
  planoSaude?: string;
}

export interface UsuarioResponse {
  id?: number;
  nome?: string;
  email?: string;
  empresa?: EmpresaResponse;
  tipo?: string;
}

export interface ProfissionalResponse {
  id?: number;
  nome?: string;
  especialidade?: string;
  convenio?: string;
  contato?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UpdateNameRequest {
  nomeNovo: string;
}

export interface UpdatePasswordRequest {
  senhaAtual: string;
  senhaNova: string;
}
