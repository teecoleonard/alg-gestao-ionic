import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  document, 
  add, 
  ellipsisVertical, 
  eye,
  create, 
  trash, 
  cash, 
  calendar, 
  person, 
  business, 
  checkmarkCircle,
  warning,
  closeCircle,
  informationCircle,
  construct,
  home
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonSearchbar,
  IonSpinner,
  IonIcon,
  IonButton,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';

// Interface para Contrato
interface Contrato {
  id: number;
  numero: string;
  cliente: string;
  dataInicio: Date;
  dataFim: Date;
  valor: number;
  status: 'ativo' | 'pendente' | 'finalizado' | 'cancelado';
}

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.page.html',
  styleUrls: ['./contratos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonSearchbar,
    IonSpinner,
    IonIcon,
    IonButton,
    IonPopover,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton
  ]
})
export class ContratosPage implements OnInit {
  contratos: Contrato[] = [];
  filteredContratos: Contrato[] = [];
  isLoading = false;
  searchTerm = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    // Registrar ícones usados nesta página
    addIcons({
      document,
      add,
      ellipsisVertical,
      eye,
      create,
      trash,
      cash,
      calendar,
      person,
      business,
      checkmarkCircle,
      warning,
      closeCircle,
      informationCircle,
      construct,
      home
    });
  }

  ngOnInit() {
    console.log('📄 ContratosPage: Inicializando tela de contratos');
    this.loadContratos();
  }

  /**
   * Carrega lista de contratos
   */
  async loadContratos() {
    console.log('📋 ContratosPage: Carregando lista de contratos...');
    this.isLoading = true;

    try {
      // Simulando carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.contratos = this.getMockContratos();
      this.filterContratos();
      this.isLoading = false;
      
      console.log('✅ ContratosPage: Contratos carregados:', this.contratos.length);
    } catch (error: any) {
      console.error('❌ ContratosPage: Erro ao carregar contratos:', error);
      this.isLoading = false;
      this.showToast('Erro ao carregar contratos', 'danger');
    }
  }

  /**
   * Dados mock para desenvolvimento
   */
  private getMockContratos(): Contrato[] {
    return [
      {
        id: 1,
        numero: '001',
        cliente: 'João Silva Santos',
        dataInicio: new Date('2024-01-15'),
        dataFim: new Date('2024-12-15'),
        valor: 5000.00,
        status: 'ativo'
      },
      {
        id: 2,
        numero: '002',
        cliente: 'Maria Santos Costa',
        dataInicio: new Date('2024-02-01'),
        dataFim: new Date('2024-08-01'),
        valor: 3500.00,
        status: 'ativo'
      },
      {
        id: 3,
        numero: '003',
        cliente: 'Empresa ABC Ltda',
        dataInicio: new Date('2024-03-10'),
        dataFim: new Date('2024-09-10'),
        valor: 7500.00,
        status: 'pendente'
      }
    ];
  }

  /**
   * Filtrar contratos
   */
  filterContratos() {
    if (!this.searchTerm.trim()) {
      this.filteredContratos = [...this.contratos];
    } else {
      const termo = this.searchTerm.toLowerCase().trim();
      this.filteredContratos = this.contratos.filter(contrato =>
        contrato.numero.toLowerCase().includes(termo) ||
        contrato.cliente.toLowerCase().includes(termo)
      );
    }
  }

  /**
   * Visualizar contrato
   */
  viewContrato(contrato: Contrato) {
    console.log('👁️ ContratosPage: Visualizando contrato:', contrato.numero);
    this.showToast(`Visualizando contrato ${contrato.numero}`, 'primary');
  }

  /**
   * Editar contrato
   */
  editContrato(contrato: Contrato) {
    console.log('✏️ ContratosPage: Editando contrato:', contrato.numero);
    this.showToast(`Editando contrato ${contrato.numero}`, 'warning');
  }

  /**
   * Excluir contrato
   */
  async deleteContrato(contratoId: number) {
    const contrato = this.contratos.find(c => c.id === contratoId);
    if (!contrato) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o contrato ${contrato.numero}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.contratos = this.contratos.filter(c => c.id !== contratoId);
            this.filterContratos();
            this.showToast(`Contrato ${contrato.numero} excluído`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Adicionar novo contrato
   */
  addContrato() {
    console.log('➕ ContratosPage: Adicionando novo contrato');
    this.showToast('Funcionalidade em desenvolvimento', 'warning');
  }

  /**
   * Obter classe CSS do status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'ativo': return 'ativo';
      case 'pendente': return 'pendente';
      case 'finalizado': return 'finalizado';
      case 'cancelado': return 'cancelado';
      default: return 'pendente';
    }
  }

  /**
   * Obter ícone do status
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'ativo': return 'checkmark-circle';
      case 'pendente': return 'warning';
      case 'finalizado': return 'checkmark-circle';
      case 'cancelado': return 'close-circle';
      default: return 'information-circle';
    }
  }

  /**
   * Obter texto do status
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'pendente': return 'Pendente';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return 'Pendente';
    }
  }

  /**
   * Exibir toast
   */
  private async showToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 