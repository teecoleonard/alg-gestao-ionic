import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardContent,
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonText,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  construct,
  logIn,
  person,
  lockClosed,
  eye,
  eyeOff
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      construct,
      logIn,
      person,
      lockClosed,
      eye,
      eyeOff
    });

    this.loginForm = this.formBuilder.group({
      cpf: ['000.000.000-00', [Validators.required, this.cpfValidator]],
      senha: ['admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Verifica se já está logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs/dashboard']);
    }
  }

  /**
   * Validador customizado para CPF
   */
  private cpfValidator(control: any) {
    const cpf = control.value?.replace(/[^0-9]/g, '');
    
    // Permite CPFs de desenvolvimento
    if (cpf === '00000000000' || control.value === 'admin') {
      return null;
    }
    
    // Validação básica de CPF (11 dígitos)
    if (cpf && cpf.length !== 11) {
      return { cpfInvalido: true };
    }
    
    return null;
  }

  /**
   * Aplicar máscara de CPF
   */
  onCpfInput(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    
    // Não aplica máscara se for 'admin'
    if (event.target.value === 'admin') {
      return;
    }
    
    // Aplica máscara XXX.XXX.XXX-XX
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      this.loginForm.patchValue({ cpf: value });
    }
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Realiza o login
   */
  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Entrando...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const credentials: LoginRequest = {
          cpf: this.loginForm.value.cpf,
          senha: this.loginForm.value.senha
        };
        
        // Tenta login online primeiro
        try {
          const response = await this.authService.login(credentials).toPromise();
          
          if (response?.token) {
            await this.showSuccessToast('Login realizado com sucesso!');
            this.router.navigate(['/tabs/dashboard']);
          } else {
            throw new Error('Resposta inválida do servidor');
          }
        } catch (onlineError) {
          console.log('Login online falhou, tentando offline:', onlineError);
          
          // Fallback para login offline (igual ao Android)
          const offlineResponse = await this.authService.loginOffline(credentials);
          
          if (offlineResponse.success) {
            await this.showSuccessToast('Login offline realizado com sucesso!');
            this.router.navigate(['/tabs/dashboard']);
          } else {
            throw new Error('Credenciais inválidas');
          }
        }
        
      } catch (error: any) {
        console.error('Erro no login:', error);
        await this.showErrorAlert('Erro no Login', error.message || 'Verifique suas credenciais e tente novamente.');
      } finally {
        await loading.dismiss();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Navega para tela de registro
   */
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Esqueceu a senha
   */
  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: 'Entre em contato com o administrador do sistema para recuperar sua senha.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Marca todos os campos do formulário como tocados
   */
  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Mostra toast de sucesso
   */
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

  /**
   * Mostra alerta de erro
   */
  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }

  /**
   * Verifica se um campo tem erro
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  /**
   * Retorna mensagem de erro para um campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName === 'cpf' ? 'CPF' : 'Senha'} é obrigatório(a)`;
    }
    
    if (field?.hasError('cpfInvalido')) {
      return 'CPF inválido';
    }
    
    if (field?.hasError('minlength')) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    
    return '';
  }
} 