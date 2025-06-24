import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, retry, timeout, finalize, switchMap, filter, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ApiResponse, SearchOptions } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('🚀 ApiService inicializado');
    console.log('🌐 BASE_URL configurada:', this.baseUrl);
    console.log('📱 Environment:', environment.production ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
  }

  /**
   * Cria headers padrão com token de autenticação
   */
  private async createHeaders(): Promise<HttpHeaders> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('🔐 Token adicionado às requisições');
    } else {
      console.log('⚠️ Nenhum token disponível');
    }

    return headers;
  }

  /**
   * Manipulador de erro global IGUAL AO ANDROID
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const timestamp = new Date().toISOString();
    
    console.error('🚨 ERRO DE API DETECTADO:', error);
    console.error(`📍 URL que falhou: ${error.url}`);
    console.error(`📊 Status Code: ${error.status}`);
    console.error(`⏰ Timestamp: ${timestamp}`);
    
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro do cliente: ${error.error.message}`;
      console.error('🖥️ ERRO DO CLIENTE:', error.error);
    } else {
      // Erro do servidor
      console.error('🌐 ERRO DO SERVIDOR:', error.error);
      
      switch (error.status) {
        case 0:
          errorMessage = 'Sem conexão com o servidor';
          console.error('📡 SEM CONEXÃO: Verifique sua internet ou se o servidor está ativo');
          break;
        case 400:
          errorMessage = 'Dados inválidos enviados';
          break;
        case 401:
          console.error('🔒 ERRO 401: Token expirado, fazendo logout...');
          this.handleUnauthorized();
          errorMessage = 'Não autorizado - Token expirado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        case 502:
          errorMessage = 'Servidor temporariamente indisponível (502)';
          console.error('🌐 ERRO 502: Backend Node.js pode estar parado ou com problema');
          break;
        case 503:
          errorMessage = 'Serviço temporariamente indisponível';
          break;
        default:
          errorMessage = `Erro HTTP: ${error.status} - ${error.statusText}`;
      }
    }
    
    console.error('💥 Erro final processado:', errorMessage);
    return throwError(() => errorMessage);
  };

  /**
   * Lida com erro 401 (igual ao Android)
   */
  private async handleUnauthorized(): Promise<void> {
    console.log('🔄 Tratando erro 401 - Fazendo logout automático');
    await this.authService.logout();
    
    // Redirecionar para login (se estivermos em um contexto de roteamento)
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = '/login';
    }
  }

  /**
   * Método genérico para requisições GET
   */
  private async makeGetRequest<T>(endpoint: string, options?: { params?: HttpParams }): Promise<Observable<T>> {
    const startTime = performance.now();
    
    console.log(`🌐 REQUISIÇÃO: GET ${this.baseUrl}${endpoint}`);
    console.log('📡 BASE_URL:', this.baseUrl);
    console.log('🔗 Endpoint:', endpoint);
    
    const headers = await this.createHeaders();
    
    // Log específico para dashboard
    if (endpoint.includes('/dashboard')) {
      console.log('📊 ========== DASHBOARD STATS ==========');
      console.log('✅ Fazendo requisição para estatísticas do dashboard');
      console.log('⏱️ Timeout configurado: 30 segundos');
      console.log('🔄 Retry configurado: 1 tentativa');
      console.log('========================================');
    }
    
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { 
      headers, 
      params: options?.params 
    }).pipe(
      timeout(30000), // 30 segundos
      retry(1), // 1 retry
      catchError(this.handleError),
      finalize(() => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.log(`⏱️ GET ${endpoint} completado em ${duration}ms`);
      })
    );
  }

  /**
   * Método genérico para requisições POST
   */
  private async makePostRequest<T>(endpoint: string, data: any): Promise<Observable<T>> {
    const headers = await this.createHeaders();
    console.log(`🌐 REQUISIÇÃO: POST ${this.baseUrl}${endpoint}`);
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers }).pipe(
      timeout(30000),
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Método genérico para requisições PUT
   */
  private async makePutRequest<T>(endpoint: string, data: any): Promise<Observable<T>> {
    const headers = await this.createHeaders();
    console.log(`🌐 REQUISIÇÃO: PUT ${this.baseUrl}${endpoint}`);
    
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers }).pipe(
      timeout(30000),
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Método genérico para requisições DELETE
   */
  private async makeDeleteRequest<T>(endpoint: string): Promise<Observable<T>> {
    const headers = await this.createHeaders();
    console.log(`🌐 REQUISIÇÃO: DELETE ${this.baseUrl}${endpoint}`);
    
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers }).pipe(
      timeout(30000),
      retry(1),
      catchError(this.handleError)
    );
  }

  // =============================================================================
  // MÉTODOS DA API - IGUAIS AO ANDROID
  // =============================================================================

  /**
   * Dashboard - Obter estatísticas gerais
   */
  async getDashboardStats(): Promise<Observable<any>> {
    return this.makeGetRequest('/api/dashboard/stats');
  }

  /**
   * Dashboard - Obter métricas financeiras
   */
  async getFinancialMetrics(): Promise<Observable<any>> {
    return this.makeGetRequest('/api/dashboard/financial-metrics');
  }

  // Clientes
  async getClientes(): Promise<Observable<any[]>> {
    return this.makeGetRequest('/api/clientes');
  }

  async getClienteById(id: number): Promise<Observable<any>> {
    return this.makeGetRequest(`/api/clientes/${id}`);
  }

  async createCliente(cliente: any): Promise<Observable<any>> {
    return this.makePostRequest('/api/clientes', cliente);
  }

  async updateCliente(id: number, cliente: any): Promise<Observable<any>> {
    return this.makePutRequest(`/api/clientes/${id}`, cliente);
  }

  async deleteCliente(id: number): Promise<Observable<any>> {
    return this.makeDeleteRequest(`/api/clientes/${id}`);
  }

  // Contratos
  async getContratos(): Promise<Observable<any[]>> {
    return this.makeGetRequest('/api/contratos');
  }

  async getContratoById(id: number): Promise<Observable<any>> {
    return this.makeGetRequest(`/api/contratos/${id}`);
  }

  async getContratosByCliente(clienteId: number): Promise<Observable<any[]>> {
    return this.makeGetRequest(`/api/contratos/cliente/${clienteId}`);
  }

  async createContrato(contrato: any): Promise<Observable<any>> {
    return this.makePostRequest('/api/contratos', contrato);
  }

  async updateContrato(id: number, contrato: any): Promise<Observable<any>> {
    return this.makePutRequest(`/api/contratos/${id}`, contrato);
  }

  async deleteContrato(id: number): Promise<Observable<any>> {
    return this.makeDeleteRequest(`/api/contratos/${id}`);
  }

  async getEquipamentosContrato(contratoId: number): Promise<Observable<any[]>> {
    return this.makeGetRequest(`/api/contratos/${contratoId}/equipamentos`);
  }

  // Equipamentos  
  async getEquipamentos(): Promise<Observable<any[]>> {
    return this.makeGetRequest('/api/equipamentos');
  }

  async getEquipamentosDisponiveis(): Promise<Observable<any[]>> {
    return this.makeGetRequest('/api/equipamentos/disponiveis');
  }

  async getEquipamentoById(id: number): Promise<Observable<any>> {
    return this.makeGetRequest(`/api/equipamentos/${id}`);
  }

  async createEquipamento(equipamento: any): Promise<Observable<any>> {
    return this.makePostRequest('/api/equipamentos', equipamento);
  }

  async updateEquipamento(id: number, equipamento: any): Promise<Observable<any>> {
    return this.makePutRequest(`/api/equipamentos/${id}`, equipamento);
  }

  async deleteEquipamento(id: number): Promise<Observable<any>> {
    return this.makeDeleteRequest(`/api/equipamentos/${id}`);
  }

  // Devoluções
  async getDevolucoes(): Promise<Observable<any[]>> {
    return this.makeGetRequest('/api/devolucoes');
  }

  async getDevolucoesByContratoId(contratoId: number): Promise<Observable<any[]>> {
    return this.makeGetRequest(`/api/devolucoes/contrato/${contratoId}`);
  }

  async updateDevolucao(id: number, devolucao: any): Promise<Observable<any>> {
    return this.makePutRequest(`/api/devolucoes/${id}`, devolucao);
  }

  // Assinaturas
  async enviarAssinatura(assinatura: any): Promise<Observable<any>> {
    return this.makePostRequest('/api/assinaturas', assinatura);
  }

  // =============================================================================
  // DADOS MOCK PARA DESENVOLVIMENTO OFFLINE
  // =============================================================================

  /**
   * Dados mock para quando não há conexão (igual ao Android)
   */
  getMockDashboardData(): any {
    console.log('📱 Usando dados MOCK offline (igual ao Android)');
    return {
      stats: {
        clientes: 45,
        contratos: 23,
        equipamentos: 156,
        devolucoes: 8
      },
      contratos: [
        {
          id: 1,
          contratoNum: '001',
          contratante: 'João Silva',
          dataVenc: '2024-07-15',
          status: 'ativo',
          valor: 2500
        },
        {
          id: 2,
          contratoNum: '002', 
          contratante: 'Maria Santos',
          dataVenc: '2024-06-20',
          status: 'vencendo',
          valor: 1800
        },
        {
          id: 3,
          contratoNum: '003',
          contratante: 'Pedro Costa',
          dataVenc: '2024-05-10',
          status: 'vencido',
          valor: 3200
        }
      ]
    };
  }
} 