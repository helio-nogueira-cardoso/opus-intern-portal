import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CourseService, Course } from '../services/course.service';
import { InternshipService, InternshipProgram } from '../services/internship.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  // Aba ativa
  activeTab: string = 'cursos';
  
  // Dados dos cursos
  courses: Course[] = [];
  loading = true;
  error = '';
  completedCourses: Set<string> = new Set();
  
  // Dados dos programas de estágio
  internshipPrograms: InternshipProgram[] = [];
  loadingPrograms = false;
  programError = '';
  selectedProgramIndex: number | null = null;
  programCourses: Course[] = [];
  loadingProgramCourses = false;
  programCoursesError = '';
  completedCoursesByProgram: Set<string> = new Set();
  
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private courseService: CourseService,
    private internshipService: InternshipService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.subscribeToCompletedCourses();
    this.loadInternshipPrograms();
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

    // Também atualiza na lista de programas se houver um programa selecionado
    if (this.selectedProgramIndex !== null) {
      if (isCurrentlyCompleted) {
        this.completedCoursesByProgram.delete(courseId);
      } else {
        this.completedCoursesByProgram.add(courseId);
      }
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
        
        // Se há um programa selecionado, atualiza também a lista de cursos do programa
        if (this.selectedProgramIndex !== null) {
          this.loadCompletedCoursesForProgram();
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar status de conclusão:', error);
        
        // Rollback da atualização otimista em caso de erro
        if (isCurrentlyCompleted) {
          this.completedCourses.add(courseId);
          if (this.selectedProgramIndex !== null) {
            this.completedCoursesByProgram.add(courseId);
          }
        } else {
          this.completedCourses.delete(courseId);
          if (this.selectedProgramIndex !== null) {
            this.completedCoursesByProgram.delete(courseId);
          }
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
   * Alterna o status de conclusão do curso na aba de programas
   */
  toggleCourseCompletionInProgram(courseId: string) {
    console.log('Alternando status do curso no programa:', courseId);
    
    // Verifica o status atual ANTES de qualquer modificação
    const isCurrentlyCompleted = this.isProgramCourseCompleted(courseId);
    
    console.log('Status atual do curso no programa:', isCurrentlyCompleted ? 'Concluído' : 'Pendente');

    // Atualização otimista da UI para o programa
    if (isCurrentlyCompleted) {
      this.completedCoursesByProgram.delete(courseId);
    } else {
      this.completedCoursesByProgram.add(courseId);
    }

    // Também atualiza a lista geral de cursos concluídos para manter sincronização entre abas
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
        console.log('Status de conclusão atualizado com sucesso no programa:', response);
        
        // Força a atualização do observable para sincronizar todas as views
        this.courseService.refreshCompletedCourses();
        
        // Recarrega os cursos concluídos para o programa para garantir sincronização
        this.loadCompletedCoursesForProgram();
        
        // Força a atualização da subscrição de cursos concluídos para sincronizar a aba de cursos
        this.subscribeToCompletedCourses();
      },
      error: (error) => {
        console.error('Erro ao atualizar status de conclusão no programa:', error);
        
        // Rollback da atualização otimista em caso de erro
        if (isCurrentlyCompleted) {
          this.completedCoursesByProgram.add(courseId);
          this.completedCourses.add(courseId);
        } else {
          this.completedCoursesByProgram.delete(courseId);
          this.completedCourses.delete(courseId);
        }
        
        // Exibe mensagem de erro para o usuário
        this.programCoursesError = 'Erro ao atualizar status do curso. Tente novamente.';
        
        // Remove a mensagem de erro após 3 segundos
        setTimeout(() => {
          this.programCoursesError = '';
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

  /**
   * Define a aba ativa
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'programas') {
      this.loadInternshipPrograms();
    }
  }

  /**
   * Carrega os programas de estágio do usuário
   */
  loadInternshipPrograms(): void {
    const userId = localStorage.getItem('uuid');
    if (!userId) {
      console.warn('User ID não encontrado no localStorage');
      this.programError = 'Usuário não autenticado';
      return;
    }

    this.loadingPrograms = true;
    this.programError = '';

    const programsSub = this.internshipService.getInternPrograms(userId).subscribe({
      next: (programs) => {
        console.log('Programas de estágio carregados:', programs);
        this.internshipPrograms = programs;
        this.loadingPrograms = false;
      },
      error: (error) => {
        console.error('Erro ao carregar programas de estágio:', error);
        this.programError = 'Erro ao carregar programas de estágio. Tente novamente.';
        this.loadingPrograms = false;
      }
    });

    this.subscription.add(programsSub);
  }

  /**
   * Seleciona um programa para ver os cursos
   */
  selectProgram(programIndex: number): void {
    this.selectedProgramIndex = programIndex;
    const program = this.internshipPrograms[programIndex];
    this.loadProgramCourses(program.id);
  }

  /**
   * Carrega os cursos de um programa específico
   */
  loadProgramCourses(programId: string): void {
    this.loadingProgramCourses = true;
    this.programCoursesError = '';
    this.programCourses = [];

    const coursesSub = this.internshipService.getProgramCourses(programId).subscribe({
      next: (courses) => {
        console.log('Cursos do programa carregados:', courses);
        this.programCourses = courses;
        this.loadingProgramCourses = false;
        
        // Carrega o status de conclusão dos cursos do programa
        this.loadCompletedCoursesForProgram();
      },
      error: (error) => {
        console.error('Erro ao carregar cursos do programa:', error);
        this.programCoursesError = 'Erro ao carregar cursos do programa. Tente novamente.';
        this.loadingProgramCourses = false;
      }
    });

    this.subscription.add(coursesSub);
  }

  /**
   * Carrega os cursos concluídos para o programa selecionado
   */
  loadCompletedCoursesForProgram(): void {
    const userId = localStorage.getItem('uuid');
    if (!userId) return;

    const completedSub = this.courseService.getCompletedCourses(userId).subscribe({
      next: (completedCourses) => {
        const completedIds = new Set(completedCourses.map(course => course.id));
        this.completedCoursesByProgram = completedIds;
      },
      error: (error) => {
        console.error('Erro ao carregar cursos concluídos:', error);
      }
    });

    this.subscription.add(completedSub);
  }

  /**
   * Verifica se um curso do programa está concluído
   */
  isProgramCourseCompleted(courseId: string): boolean {
    return this.completedCoursesByProgram.has(courseId);
  }

  /**
   * Formata uma data
   */
  formatDate(dateString: string): string {
    return this.internshipService.formatDate(dateString);
  }

  /**
   * Obtém o status do programa
   */
  getProgramStatus(program: InternshipProgram): string {
    return this.internshipService.getProgramStatus(program);
  }

  /**
   * Verifica se o programa está ativo
   */
  isProgramActive(program: InternshipProgram): boolean {
    return this.internshipService.isProgramActive(program);
  }

  /**
   * Calcula o progresso no programa selecionado
   */
  getProgressPercentage(): number {
    if (this.programCourses.length === 0) {
      return 0;
    }
    
    const completedCount = this.programCourses.filter(course => 
      this.isProgramCourseCompleted(course.id)
    ).length;
    
    return Math.round((completedCount / this.programCourses.length) * 100);
  }

  /**
   * Obtém os cursos concluídos do programa
   */
  getCompletedCoursesForProgram(): Course[] {
    return this.programCourses.filter(course => 
      this.isProgramCourseCompleted(course.id)
    );
  }

  /**
   * Obtém os cursos pendentes do programa
   */
  getPendingCoursesForProgram(): Course[] {
    return this.programCourses.filter(course => 
      !this.isProgramCourseCompleted(course.id)
    );
  }

  /**
   * Tenta recarregar os programas em caso de erro
   */
  retryLoadPrograms(): void {
    this.loadInternshipPrograms();
  }
}
