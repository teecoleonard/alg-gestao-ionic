import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonChip,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  AlertController,
  ToastController,
  IonItem,
  IonLabel,
  IonText,
  IonList,
  IonAvatar,
  IonSpinner,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  barChart,
  people,
  build,
  document,
  alert,
  checkmarkCircle,
  warning,
  closeCircle,
  home
} from 'ionicons/icons';

import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonChip,
    IonRefresher,
    IonRefresherContent,
    IonItem,
    IonLabel,
    IonList,
    IonAvatar,
    IonSpinner
  ]
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  isLoading = false;

  // Estatísticas principais (exatamente como no Android)
  stats = {
    clientes: 0,
    contratos: 0,
    equipamentos: 0,
    devolucoes: 0
  };

  // Status de contratos (como no Android)
  contratoStatus = {
    ativos: 0,
    vencendo: 0,
    vencidos: 0
  };

  // Contratos recentes
  contratosRecentes: any[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      barChart,
      people,
      build,
      document,
      alert,
      checkmarkCircle,
      warning,
      closeCircle,
      home
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  /**
   * Carrega dados do dashboard
   */
  async loadDashboardData() {
    this.isLoading = true;

    try {
      // Tenta carregar dados da API (igual ao Android)
      await this.loadOnlineData();
    } catch (error) {
      console.log('Erro ao carregar dados online, usando dados offline:', error);
      // Fallback para dados offline (igual ao Android)
      this.loadOfflineData();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carrega dados online da API - IGUAL AO ANDROID
   */
  private async loadOnlineData() {
    console.log('📊 ========== CARREGANDO DASHBOARD DATA ==========');
    console.log('🌐 URL API configurada:', environment.apiUrl);
    console.log('📡 Endpoint stats:', `${environment.apiUrl}/api/dashboard/stats`);
    
    try {
      // Carrega estatísticas do dashboard - USANDO MÉTODOS ASSÍNCRONOS
      console.log('📈 Fazendo requisição para dashboard/stats...');
      const statsObservable = await this.apiService.getDashboardStats();
      const statsData = await statsObservable.toPromise();
      console.log('✅ Dados recebidos do dashboard:', statsData);
      
      this.stats = {
        clientes: statsData.clientes || 0,
        contratos: statsData.contratos || 0,
        equipamentos: statsData.equipamentos || 0,
        devolucoes: statsData.devolucoes || 0
      };

      // Carrega contratos para análise de status - USANDO MÉTODOS ASSÍNCRONOS
      console.log('📋 Carregando contratos...');
      const contratosObservable = await this.apiService.getContratos();
      const contratos = await contratosObservable.toPromise();
      console.log('✅ Contratos carregados:', contratos?.length || 0);
      
      this.processarStatusContratos(contratos || []);
      this.contratosRecentes = this.getContratosRecentes(contratos || []);
      
      console.log('✅ Dashboard carregado com sucesso');
    } catch (error: any) {
      console.error('❌ ERRO AO CARREGAR DASHBOARD ONLINE:', error);
      console.error('🔍 Detalhes do erro:', {
        message: error.message || error,
        status: error.status,
        url: error.url
      });
      
      // Re-throw o erro para que seja capturado pelo caller
      throw new Error(`Erro ${error.status || 0}: ${error.message || error}`);
    }
  }

  /**
   * Carrega dados offline (mock) - igual ao Android
   */
  private loadOfflineData() {
    console.log('📱 Carregando dados OFFLINE (igual ao Android)');
    
    // Usando dados mock do ApiService
    const mockData = this.apiService.getMockDashboardData();
    
    this.stats = mockData.stats;
    
    this.contratoStatus = {
      ativos: 34,
      vencendo: 3,
      vencidos: 8
    };

    // Contratos mock iguais ao Android
    this.contratosRecentes = mockData.contratos;
    
    console.log('✅ Dados offline carregados com sucesso');
  }

  /**
   * Processa status dos contratos (igual ao Android)
   */
  private processarStatusContratos(contratos: any[]) {
    const hoje = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoje.getDate() + 7);

    this.contratoStatus = {
      ativos: 0,
      vencendo: 0,
      vencidos: 0
    };

    contratos.forEach(contrato => {
      if (contrato.dataVenc) {
        const dataVenc = new Date(contrato.dataVenc);
        
        if (dataVenc < hoje) {
          this.contratoStatus.vencidos++;
        } else if (dataVenc <= proximaSemana) {
          this.contratoStatus.vencendo++;
        } else {
          this.contratoStatus.ativos++;
        }
      } else {
        this.contratoStatus.ativos++;
      }
    });
  }

  /**
   * Obtém contratos recentes
   */
  private getContratosRecentes(contratos: any[]): any[] {
    return contratos
      .sort((a, b) => new Date(b.dataHoraEmissao || b.createdAt || 0).getTime() - 
                      new Date(a.dataHoraEmissao || a.createdAt || 0).getTime())
      .slice(0, 5);
  }

  /**
   * Formata valor como moeda brasileira
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Obtém cor do status do contrato
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'assinado':
      case 'ativo':
        return 'success';
      case 'pendente':
      case 'vencendo':
        return 'warning';
      case 'vencido':
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * Obtém ícone do status
   */
  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'assinado':
      case 'ativo':
        return 'checkmark-circle';
      case 'pendente':
      case 'vencendo':
        return 'warning';
      case 'vencido':
        return 'close-circle';
      default:
        return 'time';
    }
  }

  /**
   * Refresh dos dados
   */
  async doRefresh(event: any) {
    try {
      await this.loadDashboardData();
      await this.showToast('Dados atualizados com sucesso!', 'success');
    } catch (error) {
      await this.showToast('Erro ao atualizar dados', 'danger');
    } finally {
      event.target.complete();
    }
  }

  /**
   * Navegação para seções específicas
   */
  navigateToClientes() {
    this.router.navigate(['/tabs/clientes']);
  }

  navigateToContratos() {
    this.router.navigate(['/tabs/contratos']);
  }

  navigateToEquipamentos() {
    this.router.navigate(['/tabs/equipamentos']);
  }

  /**
   * Logout com confirmação (igual ao Android)
   */
  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair do sistema?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/auth/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Mostra toast
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
} 