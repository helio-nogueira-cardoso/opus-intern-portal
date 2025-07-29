import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'MENTOR' | 'INTERN' | 'ADMIN';
}

export interface LoginResponse {
  token: string;
  id: string;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api'; // Test with full URL first
  private tokenSubject: BehaviorSubject<string | null>;
  public token: Observable<string | null>;

  constructor(private http: HttpClient) {
    this.tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
    this.token = this.tokenSubject.asObservable();
  }

  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Attempting login to:', `${this.API_URL}/auth/login`);
    console.log('Credentials:', { email: credentials.email, password: '***' });

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials, { 
      headers,
      withCredentials: false // Don't send credentials with CORS
    })
      .pipe(
        map(response => {
          console.log('Login response:', response);
          // Store JWT token in localStorage
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('uuid', response.id);
            this.tokenSubject.next(response.token);
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = `${this.API_URL}/auth/register`;
    
    console.log('=== REGISTER DEBUG ===');
    console.log('URL:', url);
    console.log('Headers:', headers);
    console.log('Request Body:', {
      email: registerData.email,
      password: '***' + registerData.password.slice(-2), // Mostra só os últimos 2 chars
      role: registerData.role
    });
    console.log('Full Request Body (sem senha):', JSON.stringify({
      email: registerData.email,
      role: registerData.role
    }, null, 2));

    return this.http.post<RegisterResponse>(url, registerData, { headers })
      .pipe(
        map(response => {
          console.log('=== REGISTER SUCCESS ===');
          console.log('Response:', response);
          return response;
        }),
        catchError(error => {
          console.error('=== REGISTER ERROR ===');
          console.error('Error Status:', error.status);
          console.error('Error Message:', error.message);
          console.error('Error Body:', error.error);
          console.error('Full Error Object:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('uuid');
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenValue;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.tokenValue;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}
