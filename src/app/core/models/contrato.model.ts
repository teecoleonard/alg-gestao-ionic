import { Cliente } from './cliente.model';
import { Equipamento } from './equipamento.model';
import { StatusAssinatura, Assinatura } from './assinatura.model';

/**
 * Representa um contrato no sistema
 */
export interface Contrato {
  id: number;
  clienteId: number;
  contratoNum?: string;
  dataHoraEmissao?: string;
  dataVenc?: string;
  contratoValor: number;
  obraLocal?: string;
  contratoPeriodo?: string;
  entregaLocal?: string;
  respPedido?: string;
  contratoAss?: string;
  status_assinatura?: StatusAssinatura;
  data_assinatura?: string;
  clienteNome?: string;
  cliente?: Cliente;
  equipamentos?: EquipamentoContrato[];
  equipamentoContratos?: EquipamentoContrato[];
  assinatura?: Assinatura;
  createdAt?: string;
  updatedAt?: string;
  dias_restantes?: number;
  valor_por_dia?: number;
  valor_acumulado?: number;
}

/**
 * Representa um equipamento associado a um contrato
 */
export interface EquipamentoContrato {
  id: number;
  contratoId: number;
  equipamentoId: number;
  quantidadeEquip: number;
  valorUnitario: number;
  valorTotal: number;
  valorFrete: number;
  equipamentoNome?: string;
  equipamento?: Equipamento;
}

/**
 * Enum para status de contrato
 */
export enum StatusContrato {
  RASCUNHO = 'rascunho',
  ATIVO = 'ativo',
  SUSPENSO = 'suspenso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado'
}

/**
 * Classe utilitária para operações com Contrato
 */
export class ContratoUtils {
  
  /**
   * Gera um ID temporário único para contratos não salvos no servidor
   * IDs temporários são negativos para não conflitar com IDs reais (positivos)
   */
  static generateTempId(): number {
    const timestamp = Date.now();
    return -Math.abs(timestamp % 2147483647 + 1); // Garante < 0 e único
  }

  /**
   * Verifica se um ID de contrato é temporário
   */
  static isTempId(id: number): boolean {
    return id < 0;
  }

  /**
   * Retorna o valor do contrato formatado como moeda
   */
  static getValorFormatado(contrato: Contrato): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(contrato.contratoValor);
  }

  /**
   * Retorna a data de emissão formatada
   */
  static getDataEmissaoFormatada(contrato: Contrato): string {
    if (!contrato.dataHoraEmissao) return '';
    
    try {
      const data = new Date(contrato.dataHoraEmissao);
      return data.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return contrato.dataHoraEmissao;
    }
  }

  /**
   * Retorna a data de vencimento formatada
   */
  static getDataVencimentoFormatada(contrato: Contrato): string {
    if (!contrato.dataVenc) return '';
    
    try {
      const data = new Date(contrato.dataVenc);
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      return contrato.dataVenc;
    }
  }

  /**
   * Verifica se o contrato já está assinado
   */
  static isAssinado(contrato: Contrato): boolean {
    return contrato.status_assinatura === StatusAssinatura.ASSINADO;
  }

  /**
   * Verifica se o contrato está pendente de assinatura
   */
  static isPendente(contrato: Contrato): boolean {
    return contrato.status_assinatura === StatusAssinatura.PENDENTE || !contrato.status_assinatura;
  }

  /**
   * Verifica se o contrato foi rejeitado
   */
  static isRejeitado(contrato: Contrato): boolean {
    return contrato.status_assinatura === StatusAssinatura.REJEITADO;
  }

  /**
   * Retorna o nome do cliente do contrato
   */
  static resolverNomeCliente(contrato: Contrato): string {
    return contrato.clienteNome || contrato.cliente?.contratante || 'Cliente não encontrado';
  }

  /**
   * Retorna o número do contrato ou string vazia se nulo
   */
  static getContratoNumOuVazio(contrato: Contrato): string {
    return contrato.contratoNum || '';
  }

  /**
   * Retorna o valor efetivo do contrato para exibição.
   * Calculado exclusivamente a partir dos equipamentos quando disponíveis.
   * Se não houver equipamentos, usa o contratoValor fornecido pela API.
   */
  static getValorEfetivo(contrato: Contrato): number {
    const equipamentos = contrato.equipamentos || contrato.equipamentoContratos || [];
    
    if (equipamentos.length > 0) {
      return equipamentos.reduce((total, equip) => total + equip.valorTotal, 0);
    }
    
    return contrato.contratoValor;
  }

  /**
   * Retorna o valor efetivo formatado como moeda
   */
  static getValorEfetivoFormatado(contrato: Contrato): string {
    const valor = this.getValorEfetivo(contrato);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Verifica se o contrato está vencido
   */
  static isVencido(contrato: Contrato): boolean {
    if (!contrato.dataVenc) return false;
    
    try {
      const dataVencimento = new Date(contrato.dataVenc);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return dataVencimento < hoje;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retorna quantos dias faltam para o vencimento (negativo se vencido)
   */
  static getDiasParaVencimento(contrato: Contrato): number | null {
    if (!contrato.dataVenc) return null;
    
    try {
      const dataVencimento = new Date(contrato.dataVenc);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataVencimento.setHours(0, 0, 0, 0);
      
      const diffTime = dataVencimento.getTime() - hoje.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return null;
    }
  }

  /**
   * Retorna o status do contrato baseado na data de vencimento e assinatura
   */
  static getStatusContrato(contrato: Contrato): string {
    if (this.isAssinado(contrato)) {
      return 'Assinado';
    }
    
    if (this.isRejeitado(contrato)) {
      return 'Rejeitado';
    }
    
    if (this.isVencido(contrato)) {
      return 'Vencido';
    }
    
    const dias = this.getDiasParaVencimento(contrato);
    if (dias !== null && dias <= 7) {
      return 'Vence em breve';
    }
    
    return 'Pendente';
  }

  /**
   * Retorna a cor do status para exibição na UI
   */
  static getStatusColor(contrato: Contrato): string {
    const status = this.getStatusContrato(contrato);
    
    switch (status) {
      case 'Assinado':
        return 'success';
      case 'Rejeitado':
      case 'Vencido':
        return 'danger';
      case 'Vence em breve':
        return 'warning';
      case 'Pendente':
      default:
        return 'medium';
    }
  }

  /**
   * Valida se um contrato possui todos os campos obrigatórios
   */
  static isValid(contrato: Partial<Contrato>): boolean {
    return !!(
      contrato.clienteId &&
      contrato.contratoValor !== undefined &&
      contrato.contratoValor > 0 &&
      contrato.dataVenc
    );
  }

  /**
   * Calcula o valor total dos equipamentos de um contrato
   */
  static calcularValorTotalEquipamentos(equipamentos: EquipamentoContrato[]): number {
    return equipamentos.reduce((total, equip) => {
      return total + (equip.valorTotal || (equip.quantidadeEquip * equip.valorUnitario));
    }, 0);
  }

  /**
   * Formata o período do contrato
   */
  static formatarPeriodo(contrato: Contrato): string {
    if (!contrato.contratoPeriodo) return '';
    
    // Se já está formatado, retorna como está
    if (contrato.contratoPeriodo.includes(' ')) {
      return contrato.contratoPeriodo;
    }
    
    // Se é apenas um número, adiciona "dias"
    if (/^\d+$/.test(contrato.contratoPeriodo)) {
      return `${contrato.contratoPeriodo} dias`;
    }
    
    return contrato.contratoPeriodo;
  }
} 