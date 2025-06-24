// Exportações dos modelos principais
export * from './cliente.model';
export * from './contrato.model';
export * from './equipamento.model';
export * from './assinatura.model';
export * from './devolucao.model';

// Interfaces comuns
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UiState<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
  empty: boolean;
}

export interface DashboardStats {
  totalClientes: number;
  totalContratos: number;
  totalEquipamentos: number;
  totalDevolucoes: number;
  contratosEstaSemana: number;
  clientesHoje: number;
  equipamentosDisponiveis: number;
  devolucoesPendentes: number;
  valorTotalContratos: number;
  receitaMensal: number;
}

// ========================================
// AUTENTICAÇÃO - EXATAMENTE COMO NO ANDROID
// ========================================

export interface User {
  id: string;
  cpf: string;
  nome: string;  // Android usa 'name' mas API retorna 'nome'
  role: string;
}

export interface LoginRequest {
  cpf: string;    // ✅ CORRIGIDO: Android usa CPF, não email
  senha: string;  // ✅ CORRIGIDO: Android usa senha, não password
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;  // API às vezes retorna message
}

export interface RegisterRequest {
  cpf: string;
  nome: string;
  senha: string;
  role: string;
}

// Enums globais
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum FilterOperator {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  BETWEEN = 'between'
}

// Interfaces para filtros e pesquisa
export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: any;
  values?: any[]; // Para operador BETWEEN
}

export interface SortCriteria {
  field: string;
  direction: SortDirection;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  filters?: FilterCriteria[];
  sort?: SortCriteria[];
  search?: string;
} 