import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'MENTOR' | 'INTERN' | 'ADMIN' = 'INTERN';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Getter para verificar se as senhas coincidem
  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  // Getter para verificar se deve mostrar erro de senha
  get showPasswordMismatch(): boolean {
    return this.confirmPassword.length > 0 && !this.passwordsMatch;
  }

  // Getter para verificar se o formulário é válido
  get isFormValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      this.email.length > 0 && 
      emailRegex.test(this.email) &&
      this.password.length >= 6 && 
      this.confirmPassword.length > 0 && 
      this.passwordsMatch
    );
  }

  onSubmit(event: Event) {
    event.preventDefault();
    
    // Limpar mensagens anteriores
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validar campos obrigatórios
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }

    // Validar tamanho da senha
    if (this.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    // Validar se as senhas coincidem
    if (!this.passwordsMatch) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;

    const registerData: RegisterRequest = {
      email: this.email,
      password: this.password,
      role: this.role
    };

    console.log('=== COMPONENT REGISTER DEBUG ===');
    console.log('Form Data:', {
      email: this.email,
      password: '***' + this.password.slice(-2),
      role: this.role
    });

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('=== COMPONENT REGISTER SUCCESS ===');
        console.log('Register successful:', response);
        this.loading = false;
        this.successMessage = 'Registro realizado com sucesso! Redirecionando para o login...';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('=== COMPONENT REGISTER ERROR ===');
        console.error('Register error:', error);
        this.loading = false;
        
        // Handle different error scenarios
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Dados inválidos. Verifique as informações.';
        } else if (error.status === 409) {
          this.errorMessage = 'Email já está em uso.';
        } else if (error.status === 0) {
          this.errorMessage = 'Erro de conexão com o servidor.';
        } else {
          this.errorMessage = 'Erro interno do servidor. Tente novamente.';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
