import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CourseService, Course } from '../services/course.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  loading = true;
  error = '';
  completedCourses: Set<string> = new Set();
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.subscribeToCompletedCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Carrega todos os cursos disponíveis
   */
  loadCourses() {
    this.loading = true;
    this.error = '';

    this.courseService.getCourses().subscribe({
      next: (courses) => {
        console.log('Cursos carregados:', courses);
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cursos:', error);
        this.error = 'Erro ao carregar cursos. Tente novamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Subscreve às mudanças dos cursos concluídos
   */
  subscribeToCompletedCourses() {
    const completedSub = this.courseService.completedCourses$.subscribe({
      next: (completedIds) => {
        console.log('Cursos concluídos atualizados:', completedIds);
        this.completedCourses = completedIds;
      },
      error: (error) => {
        console.error('Erro ao carregar cursos concluídos:', error);
      }
    });

    this.subscription.add(completedSub);

    // Força o carregamento inicial dos cursos concluídos
    this.courseService.refreshCompletedCourses();
  }

  /**
   * Alterna o status de conclusão do curso
   */
  toggleCourseCompletion(courseId: string) {
    console.log('Alternando status do curso:', courseId);
    
    // Verifica o status atual ANTES de qualquer modificação
    const isCurrentlyCompleted = this.isCourseCompleted(courseId);
    
    console.log('Status atual do curso:', isCurrentlyCompleted ? 'Concluído' : 'Pendente');

    // Atualização otimista da UI
    if (isCurrentlyCompleted) {
      this.completedCourses.delete(courseId);
    } else {
      this.completedCourses.add(courseId);
    }

    // Chama o método específico baseado no status ORIGINAL
    const apiCall = isCurrentlyCompleted 
      ? this.courseService.markCourseAsIncomplete(courseId)
      : this.courseService.markCourseAsCompleted(courseId);

    const toggleSub = apiCall.subscribe({
      next: (response) => {
        console.log('Status de conclusão atualizado com sucesso:', response);
        
        // Força a atualização do observable para sincronizar
        this.courseService.refreshCompletedCourses();
      },
      error: (error) => {
        console.error('Erro ao atualizar status de conclusão:', error);
        
        // Rollback da atualização otimista em caso de erro
        if (isCurrentlyCompleted) {
          this.completedCourses.add(courseId);
        } else {
          this.completedCourses.delete(courseId);
        }
        
        // Exibe mensagem de erro para o usuário
        this.error = 'Erro ao atualizar status do curso. Tente novamente.';
        
        // Remove a mensagem de erro após 3 segundos
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });

    this.subscription.add(toggleSub);
  }

  /**
   * Verifica se um curso está concluído
   */
  isCourseCompleted(courseId: string): boolean {
    return this.completedCourses.has(courseId);
  }

  /**
   * Retorna ao login
   */
  goBack() {
    this.router.navigate(['/login']);
  }

  /**
   * Faz logout do usuário
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Tenta recarregar os cursos em caso de erro
   */
  retryLoadCourses() {
    this.loadCourses();
    this.courseService.refreshCompletedCourses();
  }
}
