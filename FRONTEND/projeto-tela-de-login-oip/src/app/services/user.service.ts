import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  role: 'MENTOR' | 'INTERN' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'MENTOR' | 'INTERN' | 'ADMIN';
}

export interface UpdateUserRequest {
  email?: string;
  role?: 'MENTOR' | 'INTERN' | 'ADMIN';
}

export interface UsersResponse {
  users: User[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api'; // Mesma URL do AuthService

  constructor(private http: HttpClient) {}

  /**
   * Obtém o token de autenticação do localStorage
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Busca todos os usuários
   */
  getUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    
    console.log('Fetching users from:', `${this.API_URL}/portal-user`);
    console.log('Headers:', headers);
    
    return this.http.get<User[]>(`${this.API_URL}/portal-user`, { 
      headers,
      withCredentials: false 
    })
    .pipe(
      map(response => {
        console.log('=== GET USERS SUCCESS ===');
        console.log('Users response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Manipula erros das requisições HTTP (seguindo o padrão do AuthService)
   */
  private handleError(error: any): Observable<never> {
    console.error('=== USER SERVICE ERROR ===');
    console.error('Error Status:', error.status);
    console.error('Error Message:', error.message);
    console.error('Error Body:', error.error);
    console.error('Full Error Object:', error);
    
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos fornecidos.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          // Remove token inválido
          localStorage.removeItem('token');
          localStorage.removeItem('uuid');
          localStorage.removeItem('role');
          break;
        case 403:
          errorMessage = 'Acesso negado. Você não tem permissão para esta operação.';
          break;
        case 404:
          errorMessage = 'Usuário não encontrado.';
          break;
        case 409:
          errorMessage = 'Usuário já existe com este email.';
          break;
        case 422:
          errorMessage = 'Dados fornecidos são inválidos.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor.';
          break;
        default:
          errorMessage = error.error?.message || `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}