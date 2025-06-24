/**
 * Representa um cliente no sistema
 */
export interface Cliente {
  id: number;
  contratante: string;
  cpfCnpj: string;
  rgIe?: string;
  endereco: string;
  bairro: string;
  cep?: string;
  cidade: string;
  estado: string;
  telefone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Classe utilitária para operações com Cliente
 */
export class ClienteUtils {
  /**
   * Retorna se o cliente é pessoa física ou jurídica com base no CPF/CNPJ
   */
  static isPessoaFisica(cliente: Cliente): boolean {
    return cliente.cpfCnpj.replace(/[^0-9]/g, '').length <= 11;
  }

  /**
   * Retorna a descrição formatada do documento
   */
  static getDocumentoFormatado(cliente: Cliente): string {
    return this.isPessoaFisica(cliente)
      ? `CPF: ${cliente.cpfCnpj}`
      : `CNPJ: ${cliente.cpfCnpj}`;
  }

  /**
   * Retorna o tipo de documento secundário formatado
   */
  static getDocumentoSecundarioFormatado(cliente: Cliente): string {
    if (this.isPessoaFisica(cliente)) {
      return cliente.rgIe ? `RG: ${cliente.rgIe}` : 'RG: Não informado';
    } else {
      return cliente.rgIe ? `IE: ${cliente.rgIe}` : 'IE: Não informado';
    }
  }

  /**
   * Retorna o endereço completo formatado
   */
  static getEnderecoCompleto(cliente: Cliente): string {
    let enderecoCompleto = cliente.endereco;
    
    if (cliente.bairro) {
      enderecoCompleto += `, ${cliente.bairro}`;
    }
    
    if (cliente.cep) {
      enderecoCompleto += `, CEP: ${cliente.cep}`;
    }
    
    enderecoCompleto += `, ${cliente.cidade}/${cliente.estado}`;
    
    return enderecoCompleto;
  }

  /**
   * Valida se um CPF é válido
   */
  static isValidCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^0-9]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Valida se um CNPJ é válido
   */
  static isValidCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^0-9]/g, '');
    
    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Validação do primeiro dígito verificador
    let length = cnpj.length - 2;
    let digits = cnpj.substring(0, length);
    let pos = length - 7;
    let sum = 0;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(digits.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(cnpj.charAt(length))) return false;

    // Validação do segundo dígito verificador
    length = length + 1;
    digits = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(digits.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(cnpj.charAt(length));
  }

  /**
   * Aplica máscara de CPF
   */
  static formatCPF(cpf: string): string {
    cpf = cpf.replace(/[^0-9]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Aplica máscara de CNPJ
   */
  static formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/[^0-9]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Aplica máscara de telefone
   */
  static formatTelefone(telefone: string): string {
    telefone = telefone.replace(/[^0-9]/g, '');
    
    if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  }

  /**
   * Aplica máscara de CEP
   */
  static formatCEP(cep: string): string {
    cep = cep.replace(/[^0-9]/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
} 