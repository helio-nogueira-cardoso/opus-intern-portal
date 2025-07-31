import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, throwError, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Course {
  id: string;
  title: string;
  description: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
}

export interface CompletedCourse {
  courseId: string;
  userId: string;
  completedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private baseUrl = 'http://localhost:8080';
  private completedCoursesSubject = new BehaviorSubject<Set<string>>(new Set());
  public completedCourses$ = this.completedCoursesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Carrega os cursos concluídos quando o service é iniciado
    this.loadCompletedCourses();
  }

  getCourses(): Observable<Course[]> {
    console.log('Buscando cursos em:', `${this.baseUrl}/api/course`);

    return this.http.get<Course[]>(`${this.baseUrl}/api/course`).pipe(
      tap(courses => console.log('Cursos recebidos:', courses.length)),
      catchError(error => {
        console.error('Erro ao buscar cursos:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Carrega os cursos concluídos do usuário atual
   */
  loadCompletedCourses(): Observable<Course[]> {
    const userId = localStorage.getItem('uuid');
    if (!userId) {
      console.warn('User ID não encontrado no localStorage');
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Buscando cursos concluídos para usuário:', userId);
    
    return this.http.get<Course[]>(`${this.baseUrl}/api/course/done/${userId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(courses => {
        console.log('Cursos concluídos recebidos:', courses);
        // Cria um Set com os IDs dos cursos concluídos para lookup rápido
        const completedIds = new Set(courses.map(course => course.id));
        this.completedCoursesSubject.next(completedIds);
        return courses;
      }),
      catchError(error => {
        console.error('Erro ao carregar cursos concluídos:', error);
        // Se der erro, inicializa com Set vazio
        this.completedCoursesSubject.next(new Set());
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se um curso específico foi concluído
   */
  isCourseCompleted(courseId: string): boolean {
    return this.completedCoursesSubject.value.has(courseId);
  }

  /**
   * Marca um curso como concluído
   */
  markCourseAsCompleted(courseId: string): Observable<any> {
    const userId = localStorage.getItem('uuid');
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Marcando curso como concluído:', courseId);

    return this.http.post(`${this.baseUrl}/api/course/${userId}/${courseId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Remove um curso dos concluídos
   */
  markCourseAsIncomplete(courseId: string): Observable<any> {
    const userId = localStorage.getItem('uuid');
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Removendo curso dos concluídos:', courseId);

    return this.http.delete(`${this.baseUrl}/api/course/${userId}/${courseId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Toggle do status de conclusão do curso
   */
  toggleCourseCompletion(courseId: string): Observable<any> {
    if (this.isCourseCompleted(courseId)) {
      return this.markCourseAsIncomplete(courseId);
    } else {
      return this.markCourseAsCompleted(courseId);
    }
  }

  /**
   * Obtém todos os IDs dos cursos concluídos
   */
  getCompletedCourseIds(): Set<string> {
    return new Set(this.completedCoursesSubject.value);
  }

  /**
   * Força o reload dos cursos concluídos (útil após login)
   */
  refreshCompletedCourses(): void {
    this.loadCompletedCourses().subscribe({
      next: () => console.log('Cursos concluídos atualizados'),
      error: (error) => console.error('Erro ao atualizar cursos concluídos:', error)
    });
  }

  createCourse(course: CreateCourseRequest) : Observable<Course> {
    console.log('Criando curso:', course);
    
    return this.http.post<Course>(`${this.baseUrl}/api/course`, course, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(newCourse => console.log('Curso criado com sucesso:', newCourse)),
      catchError(error => {
        console.error('Erro ao criar curso:', error);
        return throwError(() => error);
      })
    );
  }

  deleteCourse(courseId: string): Observable<void> {
    console.log('Excluindo curso com ID:', courseId);
    
    return this.http.delete<void>(`${this.baseUrl}/api/course/${courseId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log('Curso excluído com sucesso')),
      catchError(error => {
        console.error('Erro ao excluir curso:', error);
        return throwError(() => error);
      })
    );
  }
}