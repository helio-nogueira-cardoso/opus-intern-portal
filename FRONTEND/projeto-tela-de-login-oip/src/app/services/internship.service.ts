import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Course } from './course.service';

export interface InternshipProgram {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  mentorId: string;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipService {
  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtém todos os programas de estágio de um estagiário específico
   */
  getInternPrograms(internId: string): Observable<InternshipProgram[]> {
    console.log('Buscando programas de estágio para estagiário:', internId);
    
    return this.http.get<InternshipProgram[]>(`${this.baseUrl}/api/internship/intern/${internId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(programs => console.log('Programas de estágio recebidos:', programs)),
      catchError(error => {
        console.error('Erro ao buscar programas de estágio:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém os cursos de um programa de estágio específico
   */
  getProgramCourses(programId: string): Observable<Course[]> {
    console.log('Buscando cursos do programa:', programId);
    
    return this.http.get<Course[]>(`${this.baseUrl}/api/internship/${programId}/courses`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(courses => console.log('Cursos do programa recebidos:', courses)),
      catchError(error => {
        console.error('Erro ao buscar cursos do programa:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se um programa está ativo (baseado na data atual)
   */
  isProgramActive(program: InternshipProgram): boolean {
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    
    return now >= startDate && now <= endDate;
  }

  /**
   * Retorna o status do programa (Ativo, Finalizado, Futuro)
   */
  getProgramStatus(program: InternshipProgram): string {
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    
    if (now < startDate) {
      return 'Futuro';
    } else if (now > endDate) {
      return 'Finalizado';
    } else {
      return 'Ativo';
    }
  }

  /**
   * Formata uma data no padrão brasileiro
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
