/**
 * Modelo de dados para Equipamento
 */
export interface Equipamento {
  id: number;
  nomeEquip: string;
  codigoEquip: string;
  quantidadeDisp: number;
  precoDiaria: number;
  precoSemanal: number;
  precoQuinzenal: number;
  precoMensal: number;
  valorPatrimonio: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Enum para tipos de período de aluguel
 */
export enum TipoPeriodo {
  DIARIA = 'DIARIA',
  SEMANAL = 'SEMANAL',
  QUINZENAL = 'QUINZENAL',
  MENSAL = 'MENSAL'
}

/**
 * Interface para estatísticas de equipamento
 */
export interface EstatisticasEquipamento {
  totalEquipamentos: number;
  disponiveis: number;
  alugados: number;
  manutencao: number;
  valorTotalPatrimonio: number;
}

/**
 * Classe utilitária para operações com Equipamento
 */
export class EquipamentoUtils {
  
  /**
   * Verifica se o equipamento está disponível
   */
  static isDisponivel(equipamento: Equipamento): boolean {
    return equipamento.quantidadeDisp > 0;
  }

  /**
   * Retorna o preço baseado no período
   */
  static getPrecoPorPeriodo(equipamento: Equipamento, periodo: string): number {
    switch (periodo.toLowerCase()) {
      case 'diario':
      case 'diária':
        return equipamento.precoDiaria;
      case 'semanal':
        return equipamento.precoSemanal;
      case 'quinzenal':
        return equipamento.precoQuinzenal;
      case 'mensal':
        return equipamento.precoMensal;
      default:
        return equipamento.precoDiaria;
    }
  }

  /**
   * Formata o preço em moeda brasileira
   */
  static formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Retorna o status de disponibilidade formatado
   */
  static getStatusDisponibilidade(equipamento: Equipamento): {
    text: string;
    color: 'success' | 'warning' | 'danger';
  } {
    if (equipamento.quantidadeDisp > 5) {
      return {
        text: `${equipamento.quantidadeDisp} disponíveis`,
        color: 'success'
      };
    } else if (equipamento.quantidadeDisp > 0) {
      return {
        text: `${equipamento.quantidadeDisp} disponível(is)`,
        color: 'warning'
      };
    } else {
      return {
        text: 'Indisponível',
        color: 'danger'
      };
    }
  }

  /**
   * Calcula o valor total para uma quantidade e período
   */
  static calcularValorTotal(
    equipamento: Equipamento,
    quantidade: number,
    periodo: string
  ): number {
    const precoUnitario = this.getPrecoPorPeriodo(equipamento, periodo);
    return precoUnitario * quantidade;
  }

  /**
   * Retorna o preço do equipamento baseado no tipo de período
   */
  static getPrecoByPeriodo(equipamento: Equipamento, periodo: TipoPeriodo): number {
    switch (periodo) {
      case TipoPeriodo.DIARIA:
        return equipamento.precoDiaria;
      case TipoPeriodo.SEMANAL:
        return equipamento.precoSemanal;
      case TipoPeriodo.QUINZENAL:
        return equipamento.precoQuinzenal;
      case TipoPeriodo.MENSAL:
        return equipamento.precoMensal;
      default:
        return equipamento.precoDiaria;
    }
  }

  /**
   * Retorna o preço formatado como moeda
   */
  static getPrecoFormatado(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }

  /**
   * Retorna todos os preços formatados do equipamento
   */
  static getPrecosFormatados(equipamento: Equipamento) {
    return {
      diaria: this.getPrecoFormatado(equipamento.precoDiaria),
      semanal: this.getPrecoFormatado(equipamento.precoSemanal),
      quinzenal: this.getPrecoFormatado(equipamento.precoQuinzenal),
      mensal: this.getPrecoFormatado(equipamento.precoMensal)
    };
  }

  /**
   * Retorna a cor do status para exibição na UI
   */
  static getStatusColor(equipamento: Equipamento): string {
    if (equipamento.quantidadeDisp > 5) {
      return 'success';
    } else if (equipamento.quantidadeDisp > 0) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  /**
   * Calcula o valor total do patrimônio
   */
  static calcularValorPatrimonio(equipamento: Equipamento): number {
    return (equipamento.valorPatrimonio || 0) * equipamento.quantidadeDisp;
  }

  /**
   * Retorna o valor do patrimônio formatado
   */
  static getValorPatrimonioFormatado(equipamento: Equipamento): string {
    const valor = this.calcularValorPatrimonio(equipamento);
    return this.getPrecoFormatado(valor);
  }

  /**
   * Valida se um equipamento possui todos os campos obrigatórios
   */
  static isValid(equipamento: Partial<Equipamento>): boolean {
    return !!(
      equipamento.nomeEquip &&
      equipamento.nomeEquip.trim().length > 0 &&
      equipamento.codigoEquip &&
      equipamento.codigoEquip.trim().length > 0 &&
      equipamento.precoDiaria !== undefined &&
      equipamento.precoDiaria > 0 &&
      equipamento.quantidadeDisp !== undefined &&
      equipamento.quantidadeDisp >= 0
    );
  }

  /**
   * Calcula o melhor preço baseado no período solicitado
   */
  static calcularMelhorPreco(equipamento: Equipamento, dias: number): {
    valor: number;
    periodo: TipoPeriodo;
    formatado: string;
  } {
    const precos = [
      { valor: equipamento.precoDiaria * dias, periodo: TipoPeriodo.DIARIA },
      { valor: equipamento.precoSemanal * Math.ceil(dias / 7), periodo: TipoPeriodo.SEMANAL },
      { valor: equipamento.precoQuinzenal * Math.ceil(dias / 15), periodo: TipoPeriodo.QUINZENAL },
      { valor: equipamento.precoMensal * Math.ceil(dias / 30), periodo: TipoPeriodo.MENSAL }
    ];

    const melhorPreco = precos.reduce((menor, atual) => 
      atual.valor < menor.valor ? atual : menor
    );

    return {
      ...melhorPreco,
      formatado: this.getPrecoFormatado(melhorPreco.valor)
    };
  }

  /**
   * Gera código único para equipamento
   */
  static gerarCodigoEquipamento(nomeEquip: string, id?: number): string {
    const nome = nomeEquip.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    const idSuffix = id ? id.toString().padStart(3, '0') : '000';
    
    return `${nome}${timestamp}${idSuffix}`;
  }

  /**
   * Filtra equipamentos por nome ou código
   */
  static filtrarPorTexto(equipamentos: Equipamento[], texto: string): Equipamento[] {
    if (!texto) return equipamentos;
    
    const textoLower = texto.toLowerCase();
    return equipamentos.filter(equipamento => 
      equipamento.nomeEquip.toLowerCase().includes(textoLower) ||
      equipamento.codigoEquip.toLowerCase().includes(textoLower)
    );
  }

  /**
   * Ordena equipamentos por diferentes critérios
   */
  static ordenarEquipamentos(
    equipamentos: Equipamento[], 
    criterio: 'nome' | 'codigo' | 'preco' | 'disponibilidade'
  ): Equipamento[] {
    return [...equipamentos].sort((a, b) => {
      switch (criterio) {
        case 'nome':
          return a.nomeEquip.localeCompare(b.nomeEquip);
        case 'codigo':
          return a.codigoEquip.localeCompare(b.codigoEquip);
        case 'preco':
          return a.precoDiaria - b.precoDiaria;
        case 'disponibilidade':
          return b.quantidadeDisp - a.quantidadeDisp;
        default:
          return 0;
      }
    });
  }

  /**
   * Calcula estatísticas dos equipamentos
   */
  static calcularEstatisticas(equipamentos: Equipamento[]): EstatisticasEquipamento {
    return {
      totalEquipamentos: equipamentos.length,
      disponiveis: equipamentos.filter(e => e.quantidadeDisp > 0).length,
      alugados: equipamentos.filter(e => e.quantidadeDisp === 0).length,
      manutencao: 0, // Implementar quando houver status de manutenção
      valorTotalPatrimonio: equipamentos.reduce((total, e) => 
        total + this.calcularValorPatrimonio(e), 0
      )
    };
  }
} 