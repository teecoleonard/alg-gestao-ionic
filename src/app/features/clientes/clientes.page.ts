import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  people, 
  add, 
  ellipsisVertical, 
  call, 
  create, 
  trash, 
  card, 
  location, 
  person, 
  business, 
  checkmarkCircle,
  chevronDownCircle,
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

import { ApiService } from '../../core/services/api.service';

// Interface para Cliente
interface Cliente {
  id: number;
  nome: string;
  tipo: 'PF' | 'PJ';
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
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
export class ClientesPage implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  isLoading = false;
  searchTerm = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    // Registrar ícones usados nesta página
    addIcons({
      people,
      add,
      ellipsisVertical,
      call,
      create,
      trash,
      card,
      location,
      person,
      business,
      checkmarkCircle,
      chevronDownCircle,
      home
    });
  }

  ngOnInit() {
    console.log('👤 ClientesPage: Inicializando tela de clientes');
    this.loadClientes();
  }

  /**
   * Carrega lista de clientes
   */
  async loadClientes() {
    console.log('📋 ClientesPage: Carregando lista de clientes...');
    this.isLoading = true;

    try {
      // Simulando carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.clientes = this.getMockClientes();
      this.filterClientes();
      this.isLoading = false;
      
      console.log('✅ ClientesPage: Clientes carregados:', this.clientes.length);
    } catch (error: any) {
      console.error('❌ ClientesPage: Erro ao carregar clientes:', error);
      this.isLoading = false;
      this.showToast('Erro ao carregar clientes', 'danger');
    }
  }

  /**
   * Dados mock para desenvolvimento
   */
  private getMockClientes(): Cliente[] {
    return [
      {
        id: 1,
        nome: 'João Silva Santos',
        tipo: 'PF',
        documento: '123.456.789-01',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua das Flores, 123, Centro'
      },
      {
        id: 2,
        nome: 'Maria Santos Costa',
        tipo: 'PF',
        documento: '987.654.321-00',
        email: 'maria@email.com',
        telefone: '(21) 88888-8888',
        endereco: 'Av. Principal, 456, Jardim América'
      },
      {
        id: 3,
        nome: 'Empresa ABC Ltda',
        tipo: 'PJ',
        documento: '12.345.678/0001-90',
        email: 'contato@abc.com',
        telefone: '(31) 77777-7777',
        endereco: 'Rua Comercial, 789, Distrito Industrial'
      }
    ];
  }

  /**
   * Filtrar clientes
   */
  filterClientes() {
    if (!this.searchTerm.trim()) {
      this.filteredClientes = [...this.clientes];
    } else {
      const termo = this.searchTerm.toLowerCase().trim();
      this.filteredClientes = this.clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.documento.toLowerCase().includes(termo) ||
        (cliente.telefone && cliente.telefone.toLowerCase().includes(termo))
      );
    }
  }

  /**
   * Editar cliente
   */
  editCliente(cliente: Cliente) {
    console.log('✏️ ClientesPage: Editando cliente:', cliente.nome);
    this.showToast(`Editando ${cliente.nome}`, 'warning');
  }

  /**
   * Excluir cliente
   */
  async deleteCliente(clienteId: number) {
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir ${cliente.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.clientes = this.clientes.filter(c => c.id !== clienteId);
            this.filterClientes();
            this.showToast(`${cliente.nome} excluído`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Adicionar novo cliente
   */
  addCliente() {
    console.log('➕ ClientesPage: Adicionando novo cliente');
    this.showToast('Funcionalidade em desenvolvimento', 'warning');
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