import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  build, 
  add, 
  ellipsisVertical, 
  create, 
  trash, 
  cash, 
  document, 
  folder, 
  construct, 
  checkmarkCircle,
  warning,
  closeCircle,
  informationCircle,
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

import { Equipamento } from '../../core/models';

@Component({
  selector: 'app-equipamentos',
  templateUrl: './equipamentos.page.html',
  styleUrls: ['./equipamentos.page.scss'],
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
export class EquipamentosPage implements OnInit {
  equipamentos: Equipamento[] = [];
  filteredEquipamentos: Equipamento[] = [];
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
      build,
      add,
      ellipsisVertical,
      create,
      trash,
      cash,
      document,
      folder,
      construct,
      checkmarkCircle,
      warning,
      closeCircle,
      informationCircle,
      home
    });
  }

  ngOnInit() {
    console.log('🔧 EquipamentosPage: Inicializando tela de equipamentos');
    this.loadEquipamentos();
  }

  /**
   * Carrega lista de equipamentos
   */
  async loadEquipamentos() {
    console.log('📋 EquipamentosPage: Carregando lista de equipamentos...');
    this.isLoading = true;

    try {
      // Simulando carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.equipamentos = this.getMockEquipamentos();
      this.filterEquipamentos();
      this.isLoading = false;
      
      console.log('✅ EquipamentosPage: Equipamentos carregados:', this.equipamentos.length);
    } catch (error: any) {
      console.error('❌ EquipamentosPage: Erro ao carregar equipamentos:', error);
      this.isLoading = false;
      this.showToast('Erro ao carregar equipamentos', 'danger');
    }
  }

  /**
   * Dados mock para desenvolvimento
   */
  private getMockEquipamentos(): Equipamento[] {
    return [
      {
        id: 1,
        nomeEquip: 'Escavadeira Hidráulica',
        codigoEquip: 'ESC001',
        quantidadeDisp: 2,
        precoDiaria: 350.00,
        precoSemanal: 2100.00,
        precoQuinzenal: 3850.00,
        precoMensal: 7000.00,
        valorPatrimonio: 450000.00
      },
      {
        id: 2,
        nomeEquip: 'Betoneira Industrial',
        codigoEquip: 'BET002',
        quantidadeDisp: 0,
        precoDiaria: 80.00,
        precoSemanal: 480.00,
        precoQuinzenal: 880.00,
        precoMensal: 1600.00,
        valorPatrimonio: 15000.00
      },
      {
        id: 3,
        nomeEquip: 'Andaime Tubular',
        codigoEquip: 'AND003',
        quantidadeDisp: 15,
        precoDiaria: 25.00,
        precoSemanal: 150.00,
        precoQuinzenal: 275.00,
        precoMensal: 500.00,
        valorPatrimonio: 800.00
      },
      {
        id: 4,
        nomeEquip: 'Compressor de Ar',
        codigoEquip: 'COM004',
        quantidadeDisp: 1,
        precoDiaria: 120.00,
        precoSemanal: 720.00,
        precoQuinzenal: 1320.00,
        precoMensal: 2400.00,
        valorPatrimonio: 25000.00
      }
    ];
  }

  /**
   * Filtrar equipamentos
   */
  filterEquipamentos() {
    if (!this.searchTerm.trim()) {
      this.filteredEquipamentos = [...this.equipamentos];
    } else {
      const termo = this.searchTerm.toLowerCase().trim();
      this.filteredEquipamentos = this.equipamentos.filter(equipamento =>
        equipamento.nomeEquip.toLowerCase().includes(termo) ||
        equipamento.codigoEquip.toLowerCase().includes(termo)
      );
    }
  }

  /**
   * Editar equipamento
   */
  editEquipamento(equipamento: Equipamento) {
    console.log('✏️ EquipamentosPage: Editando equipamento:', equipamento.codigoEquip);
    this.showToast(`Editando ${equipamento.nomeEquip}`, 'warning');
  }

  /**
   * Excluir equipamento
   */
  async deleteEquipamento(equipamentoId: number) {
    const equipamento = this.equipamentos.find(e => e.id === equipamentoId);
    if (!equipamento) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir ${equipamento.nomeEquip}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.equipamentos = this.equipamentos.filter(e => e.id !== equipamentoId);
            this.filterEquipamentos();
            this.showToast(`${equipamento.nomeEquip} excluído`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Adicionar novo equipamento
   */
  addEquipamento() {
    console.log('➕ EquipamentosPage: Adicionando novo equipamento');
    this.showToast('Funcionalidade em desenvolvimento', 'warning');
  }

  /**
   * Obter classe CSS do status baseado na disponibilidade
   */
  getStatusClass(equipamento: Equipamento): string {
    if (equipamento.quantidadeDisp > 5) {
      return 'disponivel';
    } else if (equipamento.quantidadeDisp > 0) {
      return 'alugado'; // Pouco disponível
    } else {
      return 'manutencao'; // Indisponível
    }
  }

  /**
   * Obter ícone do status baseado na disponibilidade
   */
  getStatusIcon(equipamento: Equipamento): string {
    const quantidade = equipamento.quantidadeDisp || 0;
    
    if (quantidade > 5) {
      return 'checkmark-circle';
    } else if (quantidade > 0) {
      return 'warning';
    } else {
      return 'close-circle';
    }
  }

  /**
   * Obter texto do status baseado na disponibilidade
   */
  getStatusText(equipamento: Equipamento): string {
    if (equipamento.quantidadeDisp > 5) {
      return `${equipamento.quantidadeDisp} Disponíveis`;
    } else if (equipamento.quantidadeDisp > 0) {
      return `${equipamento.quantidadeDisp} Disponível(is)`;
    } else {
      return 'Indisponível';
    }
  }

  /**
   * Obter o nome do equipamento para exibição
   */
  getNome(equipamento: Equipamento): string {
    return equipamento.nomeEquip;
  }

  /**
   * Obter o código do equipamento para exibição
   */
  getCodigo(equipamento: Equipamento): string {
    return equipamento.codigoEquip;
  }

  /**
   * Obter categoria baseada no nome (simulada)
   */
  getCategoria(equipamento: Equipamento): string {
    const nome = equipamento.nomeEquip.toLowerCase();
    if (nome.includes('escavadeira') || nome.includes('trator')) {
      return 'Máquinas Pesadas';
    } else if (nome.includes('betoneira') || nome.includes('compressor')) {
      return 'Equipamentos';
    } else if (nome.includes('andaime')) {
      return 'Estruturas';
    } else {
      return 'Ferramentas';
    }
  }

  /**
   * Obter descrição simulada baseada no equipamento
   */
  getDescricao(equipamento: Equipamento): string {
    return `${equipamento.nomeEquip} - Código: ${equipamento.codigoEquip}`;
  }

  /**
   * Obter valor diário do equipamento
   */
  getValor(equipamento: Equipamento): number {
    return equipamento.precoDiaria;
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