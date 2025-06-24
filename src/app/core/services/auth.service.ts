import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  ApiResponse 
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly STORAGE_KEYS = {
    TOKEN: 'ALG_Gestao_Session_token',
    USER_ID: 'ALG_Gestao_Session_userId', 
    USER_NAME: 'ALG_Gestao_Session_userName',
    USER_CPF: 'ALG_Gestao_Session_userCpf',
    USER_ROLE: 'ALG_Gestao_Session_userRole',
    EXPIRES_IN: 'ALG_Gestao_Session_expiresIn'
  };

  private readonly THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
    console.log('🚀 AuthService inicializado');
    console.log('⏰ Sessão configurada para 30 dias (igual ao Android)');
  }

  /**
   * Verifica se existe uma sessão ativa - IGUAL AO ANDROID
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const [tokenResult, expiresResult] = await Promise.all([
        Preferences.get({ key: this.STORAGE_KEYS.TOKEN }),
        Preferences.get({ key: this.STORAGE_KEYS.EXPIRES_IN })
      ]);

      const token = tokenResult.value;
      const expiresIn = expiresResult.value ? parseInt(expiresResult.value) : 0;

      if (!token) {
        console.log('❌ SessionManager: Token não encontrado');
        return false;
      }

      const isExpired = expiresIn < Date.now();
      if (isExpired) {
        console.log('⏰ SessionManager: Sessão expirada localmente');
        await this.clearSession();
        return false;
      }

      console.log('✅ SessionManager: Sessão válida');
      console.log(`🕐 Expira em: ${new Date(expiresIn).toLocaleString('pt-BR')}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return false;
    }
  }

  /**
   * Realiza login com CPF e senha (igual ao Android)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const loginData = {
      cpf: credentials.cpf,
      senha: credentials.senha
    };

    console.log('🔐 Fazendo login para CPF:', credentials.cpf);
    console.log('🌐 URL da API:', `${environment.apiUrl}/api/usuarios/login`);

    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/usuarios/login`, loginData)
      .pipe(
        tap(response => {
          if (response && response.token && response.user) {
            console.log('✅ Login bem-sucedido, salvando sessão...');
            this.saveUserSession(response.token, response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Login offline (credenciais padrão para desenvolvimento)
   */
  async loginOffline(credentials: LoginRequest): Promise<{ success: boolean; message?: string }> {
    // Credenciais de desenvolvimento - exatamente como o Android
    const validCredentials = [
      { cpf: '000.000.000-00', senha: 'admin123' },
      { cpf: '00000000000', senha: 'admin123' },
      { cpf: 'admin', senha: 'admin123' }
    ];

    const isValid = validCredentials.some(valid => 
      valid.cpf === credentials.cpf && valid.senha === credentials.senha
    );

    if (isValid) {
      console.log('🔓 Login offline autorizado');
      
      // Simula usuário offline igual ao Android
      const offlineUser: User = {
        id: '1',
        cpf: credentials.cpf,
        nome: 'Administrador',
        role: 'admin'
      };

      const fakeToken = `offline_token_${Date.now()}`;
      await this.saveUserSession(fakeToken, offlineUser);
      
      return { success: true, message: 'Login offline realizado com sucesso' };
    }

    return { success: false, message: 'Credenciais inválidas' };
  }

  /**
   * Registra novo usuário
   */
  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/usuarios/register`, userData)
      .pipe(
        tap(response => {
          if (response && response.token && response.user) {
            this.saveUserSession(response.token, response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Salva sessão do usuário - IGUAL AO SessionManager DO ANDROID
   */
  private async saveUserSession(token: string, user: User): Promise<void> {
    const expiresIn = Date.now() + this.THIRTY_DAYS_MS;

    console.log('💾 Salvando sessão do usuário:', user.nome);
    console.log('🔑 Token recebido (primeiros 50 chars):', token.substring(0, 50) + '...');
    console.log('⏰ Sessão expira em:', new Date(expiresIn).toLocaleString('pt-BR'));
    console.log('📏 Tamanho do token:', token.length, 'caracteres');

    try {
      await Promise.all([
        Preferences.set({ key: this.STORAGE_KEYS.TOKEN, value: token }),
        Preferences.set({ key: this.STORAGE_KEYS.USER_ID, value: user.id.toString() }),
        Preferences.set({ key: this.STORAGE_KEYS.USER_NAME, value: user.nome }),
        Preferences.set({ key: this.STORAGE_KEYS.USER_CPF, value: user.cpf }),
        Preferences.set({ key: this.STORAGE_KEYS.USER_ROLE, value: user.role }),
        Preferences.set({ key: this.STORAGE_KEYS.EXPIRES_IN, value: expiresIn.toString() })
      ]);

      this.currentUserSubject.next(user);
      console.log('✅ Sessão salva com sucesso!');
      
      // Log de debug para verificar se foi salvo corretamente
      const tokenCheck = await Preferences.get({ key: this.STORAGE_KEYS.TOKEN });
      console.log('🔍 Verificação: Token salvo?', tokenCheck.value ? 'SIM' : 'NÃO');
      
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      throw error;
    }
  }

  /**
   * Carrega usuário atual do storage - IGUAL AO ANDROID
   */
  private async loadCurrentUser(): Promise<void> {
    try {
      console.log('🔄 Carregando usuário atual do storage...');
      
      const [tokenResult, userIdResult, userNameResult, userCpfResult, userRoleResult, expiresResult] = await Promise.all([
        Preferences.get({ key: this.STORAGE_KEYS.TOKEN }),
        Preferences.get({ key: this.STORAGE_KEYS.USER_ID }),
        Preferences.get({ key: this.STORAGE_KEYS.USER_NAME }),
        Preferences.get({ key: this.STORAGE_KEYS.USER_CPF }),
        Preferences.get({ key: this.STORAGE_KEYS.USER_ROLE }),
        Preferences.get({ key: this.STORAGE_KEYS.EXPIRES_IN })
      ]);

      const token = tokenResult.value;
      const expiresIn = expiresResult.value ? parseInt(expiresResult.value) : 0;

      console.log('🔍 Token encontrado:', token ? 'SIM' : 'NÃO');
      console.log('⏰ Expira em:', expiresIn ? new Date(expiresIn).toLocaleString('pt-BR') : 'Não definido');

      if (!token || expiresIn < Date.now()) {
        console.log('❌ Token ausente ou expirado, limpando sessão');
        await this.clearSession();
        return;
      }

      const user: User = {
        id: userIdResult.value || '',
        cpf: userCpfResult.value || '',
        nome: userNameResult.value || '',
        role: userRoleResult.value || 'cliente'
      };

      console.log('✅ Usuário carregado:', user.nome);
      this.currentUserSubject.next(user);
      
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      await this.clearSession();
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtém token de autenticação - COM LOG DE DEBUG
   */
  async getToken(): Promise<string | null> {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEYS.TOKEN });
      const token = result.value;
      
      if (token) {
        console.log('🔑 Token recuperado para requisição (primeiros 30 chars):', token.substring(0, 30) + '...');
        console.log('📏 Tamanho do token:', token.length, 'caracteres');
        
        // Verificar se a sessão ainda é válida antes de retornar o token
        const isValid = await this.isLoggedIn();
        if (!isValid) {
          console.log('❌ Sessão inválida, não retornando token');
          return null;
        }
        
        return token;
      } else {
        console.log('❌ Token não encontrado no storage');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  }

  /**
   * Obtém headers de autenticação
   */
  async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Realiza logout - IGUAL AO ANDROID
   */
  async logout(): Promise<void> {
    console.log('🚪 Fazendo logout...');
    await this.clearSession();
    this.currentUserSubject.next(null);
    console.log('✅ Logout realizado com sucesso');
  }

  /**
   * Limpa sessão do storage - IGUAL AO ANDROID
   */
  private async clearSession(): Promise<void> {
    try {
      await Promise.all([
        Preferences.remove({ key: this.STORAGE_KEYS.TOKEN }),
        Preferences.remove({ key: this.STORAGE_KEYS.USER_ID }),
        Preferences.remove({ key: this.STORAGE_KEYS.USER_NAME }),
        Preferences.remove({ key: this.STORAGE_KEYS.USER_CPF }),
        Preferences.remove({ key: this.STORAGE_KEYS.USER_ROLE }),
        Preferences.remove({ key: this.STORAGE_KEYS.EXPIRES_IN })
      ]);
      console.log('🧹 Sessão limpa do storage');
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
    }
  }

  /**
   * Tratamento de erro padrão
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = error.error.message;
    } else {
      // Erro do servidor
      console.error('🌐 ERRO HTTP no AuthService:', {
        status: error.status,
        error: error.error,
        message: error.message
      });
      
      switch (error.status) {
        case 401:
          errorMessage = 'Credenciais inválidas';
          break;
        case 400:
          errorMessage = error.error?.message || 'Dados inválidos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = error.error?.message || error.message || 'Erro de conexão';
      }
    }

    console.error('❌ Erro processado no AuthService:', errorMessage);
    return throwError(() => errorMessage);
  };
} 