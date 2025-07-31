import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading = false;

        if (response.role === 'INTERN') {
          this.router.navigate(['/welcome']);
        }
        else if (response.role === 'MENTOR') {
          this.router.navigate(['/mentor-dashboard']);
        } else if (response.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.errorMessage = 'Role desconhecida. Acesso negado.';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        
        // Handle different error scenarios
        if (error.status === 403) {
          this.errorMessage = 'Email ou senha incorretos.';
        } else if (error.status === 0) {
          this.errorMessage = 'Erro de conexão com o servidor.';
        } else {
          this.errorMessage = 'Erro interno do servidor. Tente novamente.';
        }
      }
    });
  }
}