import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonText,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  lockClosedOutline, 
  checkmarkCircleOutline,
  businessOutline,
  idCardOutline 
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ 
      personOutline,
      lockClosedOutline, 
      checkmarkCircleOutline,
      businessOutline,
      idCardOutline 
    });

    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmaSenha: ['', [Validators.required]],
      role: ['cliente', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs/dashboard']);
    }
  }

  private cpfValidator(control: any) {
    const cpf = control.value?.replace(/[^0-9]/g, '');
    
    if (cpf && cpf.length !== 11) {
      return { cpfInvalido: true };
    }
    
    return null;
  }

  private passwordMatchValidator(group: FormGroup) {
    const senha = group.get('senha')?.value;
    const confirmaSenha = group.get('confirmaSenha')?.value;
    return senha === confirmaSenha ? null : { senhasNaoCoincidem: true };
  }

  onCpfInput(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      this.registerForm.patchValue({ cpf: value });
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Criando conta...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const registerData: RegisterRequest = {
          cpf: this.registerForm.value.cpf.replace(/[^0-9]/g, ''),
          nome: this.registerForm.value.nome,
          senha: this.registerForm.value.senha,
          role: this.registerForm.value.role
        };
        
        const response = await this.authService.register(registerData).toPromise();
        
        if (response?.token) {
          await this.showSuccessToast('Conta criada com sucesso!');
          this.router.navigate(['/tabs/dashboard']);
        } else {
          throw new Error('Resposta inválida do servidor');
        }
        
      } catch (error: any) {
        console.error('Erro no registro:', error);
        await this.showErrorAlert('Erro no Registro', error.message || 'Erro ao criar conta. Tente novamente.');
      } finally {
        await loading.dismiss();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  hasPasswordMismatch(): boolean {
    return !!(this.registerForm.hasError('senhasNaoCoincidem') && 
              this.registerForm.get('confirmaSenha')?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      const fieldNames: { [key: string]: string } = {
        nome: 'Nome',
        cpf: 'CPF',
        senha: 'Senha',
        confirmaSenha: 'Confirmação de senha',
        role: 'Tipo de usuário'
      };
      return `${fieldNames[fieldName]} é obrigatório(a)`;
    }
    
    if (field?.hasError('minlength')) {
      if (fieldName === 'nome') return 'Nome deve ter pelo menos 2 caracteres';
      if (fieldName === 'senha') return 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (field?.hasError('cpfInvalido')) {
      return 'CPF inválido';
    }
    
    return '';
  }
} 