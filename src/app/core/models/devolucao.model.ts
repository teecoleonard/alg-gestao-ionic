import { Cliente } from './cliente.model';
import { Contrato } from './contrato.model';
import { Equipamento } from './equipamento.model';

/**
 * Representa uma devolução no sistema
 */
export interface Devolucao {
  id: number;
  contratoId: number;
  clienteId: number;
  numeroDeVolucao: string;
  dataDeVolucao: string;
  equipamentoId: number;
  quantidadeDevolvida: number;
  status: StatusDevolucao;
  observacoes?: string;
  motivoRejeicao?: string;
  valorMulta?: number;
  // Relacionamentos
  contrato?: Contrato;
  cliente?: Cliente;
  equipamento?: Equipamento;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Enum para status da devolução
 */
export enum StatusDevolucao {
  PENDENTE = 'PENDENTE',
  DEVOLVIDO = 'DEVOLVIDO',
  AVARIADO = 'AVARIADO',
  FALTANTE = 'FALTANTE',
  PROCESSADO = 'PROCESSADO'
}

/**
 * Interface para estatísticas de devolução
 */
export interface EstatisticasDevolucao {
  totalDevolucoes: number;
  pendentes: number;
  devolvidos: number;
  avariados: number;
  faltantes: number;
  valorTotalMultas: number;
}

/**
 * Interface para formulário de devolução
 */
export interface FormularioDevolucao {
  contratoId: number;
  equipamentoId: number;
  quantidadeDevolvida: number;
  status: StatusDevolucao;
  observacoes?: string;
  valorMulta?: number;
}

/**
 * Classe utilitária para operações com Devolução
 */
export class DevolucaoUtils {
  
  /**
   * Gera número único para devolução
   */
  static gerarNumeroDevolucao(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV${timestamp.toString().slice(-6)}${random}`;
  }

  /**
   * Retorna a data de devolução formatada
   */
  static getDataDevolucaoFormatada(devolucao: Devolucao): string {
    if (!devolucao.dataDeVolucao) return '';
    
    try {
      const data = new Date(devolucao.dataDeVolucao);
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      return devolucao.dataDeVolucao;
    }
  }

  /**
   * Verifica se a devolução está pendente
   */
  static isPendente(devolucao: Devolucao): boolean {
    return devolucao.status === StatusDevolucao.PENDENTE;
  }

  /**
   * Verifica se a devolução foi concluída
   */
  static isDevolvido(devolucao: Devolucao): boolean {
    return devolucao.status === StatusDevolucao.DEVOLVIDO;
  }

  /**
   * Verifica se o equipamento foi devolvido avariado
   */
  static isAvariado(devolucao: Devolucao): boolean {
    return devolucao.status === StatusDevolucao.AVARIADO;
  }

  /**
   * Verifica se há equipamentos faltantes
   */
  static isFaltante(devolucao: Devolucao): boolean {
    return devolucao.status === StatusDevolucao.FALTANTE;
  }

  /**
   * Verifica se a devolução foi processada
   */
  static isProcessado(devolucao: Devolucao): boolean {
    return devolucao.status === StatusDevolucao.PROCESSADO;
  }

  /**
   * Retorna a cor do status para exibição na UI
   */
  static getStatusColor(devolucao: Devolucao): string {
    switch (devolucao.status) {
      case StatusDevolucao.DEVOLVIDO:
      case StatusDevolucao.PROCESSADO:
        return 'success';
      case StatusDevolucao.AVARIADO:
      case StatusDevolucao.FALTANTE:
        return 'danger';
      case StatusDevolucao.PENDENTE:
      default:
        return 'warning';
    }
  }

  /**
   * Retorna o texto do status
   */
  static getStatusTexto(devolucao: Devolucao): string {
    switch (devolucao.status) {
      case StatusDevolucao.PENDENTE:
        return 'Pendente';
      case StatusDevolucao.DEVOLVIDO:
        return 'Devolvido';
      case StatusDevolucao.AVARIADO:
        return 'Avariado';
      case StatusDevolucao.FALTANTE:
        return 'Faltante';
      case StatusDevolucao.PROCESSADO:
        return 'Processado';
      default:
        return 'Desconhecido';
    }
  }

  /**
   * Retorna o ícone do status
   */
  static getStatusIcon(devolucao: Devolucao): string {
    switch (devolucao.status) {
      case StatusDevolucao.DEVOLVIDO:
        return 'checkmark-circle';
      case StatusDevolucao.AVARIADO:
        return 'warning';
      case StatusDevolucao.FALTANTE:
        return 'close-circle';
      case StatusDevolucao.PROCESSADO:
        return 'checkmark-done-circle';
      case StatusDevolucao.PENDENTE:
      default:
        return 'time';
    }
  }

  /**
   * Retorna o valor da multa formatado como moeda
   */
  static getValorMultaFormatado(devolucao: Devolucao): string {
    if (!devolucao.valorMulta || devolucao.valorMulta === 0) {
      return 'Sem multa';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(devolucao.valorMulta);
  }

  /**
   * Verifica se há multa aplicada
   */
  static temMulta(devolucao: Devolucao): boolean {
    return !!(devolucao.valorMulta && devolucao.valorMulta > 0);
  }

  /**
   * Valida se uma devolução possui todos os campos obrigatórios
   */
  static isValid(devolucao: Partial<FormularioDevolucao>): boolean {
    return !!(
      devolucao.contratoId &&
      devolucao.equipamentoId &&
      devolucao.quantidadeDevolvida !== undefined &&
      devolucao.quantidadeDevolvida > 0 &&
      devolucao.status
    );
  }

  /**
   * Calcula estatísticas das devoluções
   */
  static calcularEstatisticas(devolucoes: Devolucao[]): EstatisticasDevolucao {
    return {
      totalDevolucoes: devolucoes.length,
      pendentes: devolucoes.filter(d => this.isPendente(d)).length,
      devolvidos: devolucoes.filter(d => this.isDevolvido(d)).length,
      avariados: devolucoes.filter(d => this.isAvariado(d)).length,
      faltantes: devolucoes.filter(d => this.isFaltante(d)).length,
      valorTotalMultas: devolucoes.reduce((total, d) => total + (d.valorMulta || 0), 0)
    };
  }

  /**
   * Filtra devoluções por status
   */
  static filtrarPorStatus(devolucoes: Devolucao[], status: StatusDevolucao): Devolucao[] {
    return devolucoes.filter(devolucao => devolucao.status === status);
  }

  /**
   * Filtra devoluções por contrato
   */
  static filtrarPorContrato(devolucoes: Devolucao[], contratoId: number): Devolucao[] {
    return devolucoes.filter(devolucao => devolucao.contratoId === contratoId);
  }

  /**
   * Filtra devoluções por cliente
   */
  static filtrarPorCliente(devolucoes: Devolucao[], clienteId: number): Devolucao[] {
    return devolucoes.filter(devolucao => devolucao.clienteId === clienteId);
  }

  /**
   * Filtra devoluções por equipamento
   */
  static filtrarPorEquipamento(devolucoes: Devolucao[], equipamentoId: number): Devolucao[] {
    return devolucoes.filter(devolucao => devolucao.equipamentoId === equipamentoId);
  }

  /**
   * Ordena devoluções por data (mais recente primeiro)
   */
  static ordenarPorData(devolucoes: Devolucao[]): Devolucao[] {
    return [...devolucoes].sort((a, b) => {
      const dataA = new Date(a.dataDeVolucao).getTime();
      const dataB = new Date(b.dataDeVolucao).getTime();
      return dataB - dataA;
    });
  }

  /**
   * Processa uma devolução (muda status para processado)
   */
  static marcarComoProcessado(devolucao: Devolucao): Partial<Devolucao> {
    return {
      ...devolucao,
      status: StatusDevolucao.PROCESSADO,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Aplica multa a uma devolução
   */
  static aplicarMulta(devolucao: Devolucao, valorMulta: number, motivo?: string): Partial<Devolucao> {
    return {
      ...devolucao,
      valorMulta,
      motivoRejeicao: motivo,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Calcula multa baseada no valor do equipamento e dias de atraso
   */
  static calcularMulta(valorEquipamento: number, diasAtraso: number, percentualMulta: number = 0.1): number {
    if (diasAtraso <= 0) return 0;
    
    const multaBase = valorEquipamento * percentualMulta;
    return multaBase * diasAtraso;
  }

  /**
   * Verifica se a devolução está em atraso baseada na data esperada
   */
  static isAtrasado(devolucao: Devolucao, dataEsperada: string): boolean {
    try {
      const dataDevolucao = new Date(devolucao.dataDeVolucao);
      const dataEsperadaDate = new Date(dataEsperada);
      
      return dataDevolucao > dataEsperadaDate;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calcula dias de atraso
   */
  static calcularDiasAtraso(devolucao: Devolucao, dataEsperada: string): number {
    try {
      const dataDevolucao = new Date(devolucao.dataDeVolucao);
      const dataEsperadaDate = new Date(dataEsperada);
      
      if (dataDevolucao <= dataEsperadaDate) return 0;
      
      const diffTime = dataDevolucao.getTime() - dataEsperadaDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }
} 