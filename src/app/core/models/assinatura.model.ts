/**
 * Representa uma assinatura digital no sistema
 */
export interface Assinatura {
  id: number;
  contratoId: number;
  assinaturaData?: string;
  assinatura?: string; // Base64 da assinatura
  dataAssinatura?: string;
  status: StatusAssinatura;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Enum para status da assinatura
 */
export enum StatusAssinatura {
  PENDENTE = 'PENDENTE',
  ASSINADO = 'ASSINADO',
  REJEITADO = 'REJEITADO',
  EXPIRADO = 'EXPIRADO'
}

/**
 * Interface para dados da assinatura durante o processo
 */
export interface DadosAssinatura {
  assinaturaBase64: string;
  timestamp: string;
  observacoes?: string;
}

/**
 * Classe utilitária para operações com Assinatura
 */
export class AssinaturaUtils {
  
  /**
   * Valida se uma assinatura em base64 é válida
   */
  static isValidBase64(base64: string): boolean {
    if (!base64) return false;
    
    try {
      // Verifica se é um base64 válido de imagem
      const isValidDataUrl = base64.startsWith('data:image/');
      const hasValidBase64 = base64.includes(',') && base64.split(',')[1].length > 0;
      
      return isValidDataUrl && hasValidBase64;
    } catch (error) {
      return false;
    }
  }

  /**
   * Converte base64 para blob
   */
  static base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }

  /**
   * Retorna a data de assinatura formatada
   */
  static getDataAssinaturaFormatada(assinatura: Assinatura): string {
    if (!assinatura.dataAssinatura) return '';
    
    try {
      const data = new Date(assinatura.dataAssinatura);
      return data.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return assinatura.dataAssinatura;
    }
  }

  /**
   * Verifica se a assinatura foi realizada
   */
  static isAssinado(assinatura: Assinatura): boolean {
    return assinatura.status === StatusAssinatura.ASSINADO;
  }

  /**
   * Verifica se a assinatura está pendente
   */
  static isPendente(assinatura: Assinatura): boolean {
    return assinatura.status === StatusAssinatura.PENDENTE;
  }

  /**
   * Verifica se a assinatura foi rejeitada
   */
  static isRejeitado(assinatura: Assinatura): boolean {
    return assinatura.status === StatusAssinatura.REJEITADO;
  }

  /**
   * Verifica se a assinatura expirou
   */
  static isExpirado(assinatura: Assinatura): boolean {
    return assinatura.status === StatusAssinatura.EXPIRADO;
  }

  /**
   * Retorna a cor do status para exibição na UI
   */
  static getStatusColor(assinatura: Assinatura): string {
    switch (assinatura.status) {
      case StatusAssinatura.ASSINADO:
        return 'success';
      case StatusAssinatura.REJEITADO:
      case StatusAssinatura.EXPIRADO:
        return 'danger';
      case StatusAssinatura.PENDENTE:
      default:
        return 'warning';
    }
  }

  /**
   * Retorna o texto do status
   */
  static getStatusTexto(assinatura: Assinatura): string {
    switch (assinatura.status) {
      case StatusAssinatura.ASSINADO:
        return 'Assinado';
      case StatusAssinatura.REJEITADO:
        return 'Rejeitado';
      case StatusAssinatura.EXPIRADO:
        return 'Expirado';
      case StatusAssinatura.PENDENTE:
      default:
        return 'Pendente';
    }
  }

  /**
   * Gera timestamp atual para assinatura
   */
  static gerarTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Cria dados de assinatura a partir do base64
   */
  static criarDadosAssinatura(base64: string, observacoes?: string): DadosAssinatura {
    return {
      assinaturaBase64: base64,
      timestamp: this.gerarTimestamp(),
      observacoes
    };
  }

  /**
   * Valida se os dados de assinatura são válidos
   */
  static isValidDadosAssinatura(dados: DadosAssinatura): boolean {
    return this.isValidBase64(dados.assinaturaBase64) && !!dados.timestamp;
  }

  /**
   * Comprime a imagem da assinatura para otimizar armazenamento
   */
  static async comprimirAssinatura(base64: string, qualidade: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Define tamanho máximo para a assinatura
        const maxWidth = 400;
        const maxHeight = 200;
        
        let { width, height } = img;
        
        // Redimensiona mantendo proporção
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          // Fundo branco para PNG transparente
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          
          // Desenha a imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Retorna como JPEG comprimido
          const compressed = canvas.toDataURL('image/jpeg', qualidade);
          resolve(compressed);
        } else {
          resolve(base64);
        }
      };
      
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }

  /**
   * Limpa uma assinatura (remove do canvas)
   */
  static limparAssinatura(): DadosAssinatura {
    return {
      assinaturaBase64: '',
      timestamp: this.gerarTimestamp()
    };
  }

  /**
   * Verifica se uma assinatura tem conteúdo válido
   */
  static temConteudo(assinatura: Assinatura): boolean {
    return !!(assinatura.assinatura && this.isValidBase64(assinatura.assinatura));
  }
} 