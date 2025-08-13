import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course, CreateCourseRequest } from '../services/course.service';
import { UserService, User } from '../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

interface InternshipProgram {
  id: string;  
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  mentorId: string;
}

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent implements OnInit {
  courses: Course[] = [];
  completedCourses: Course[] = [];
  
  selectedUserIndex: number | null = null;
  selectedProgramIndex: number | null = null;
  programCourses: Course[] = [];
  loadingProgramCourses = false;
  programCoursesError = '';
  
  users: User[] = [];
  loading = false;
  loadingUsers = false;
  error = '';
  userError = '';

  internshipPrograms: InternshipProgram[] = [];
  loadingPrograms = false;
  programError = '';

  // Programas do estagiário selecionado
  internPrograms: InternshipProgram[] = [];
  currentMentorPrograms: InternshipProgram[] = [];
  otherMentorsPrograms: InternshipProgram[] = [];
  loadingInternPrograms = false;
  internProgramsError = '';

  // Cursos de programa específico para estagiário
  selectedInternProgramId: string | null = null;
  selectedInternProgramCourses: Course[] = [];
  completedCoursesByIntern: Set<string> = new Set();
  loadingInternProgramCourses = false;
  internProgramCoursesError = '';

  newCourse: CreateCourseRequest = {
    title: '',
    description: ''
  };

  private destroyRef = inject(DestroyRef);

  activeTab: string = 'geral';
  
  newInternshipProgram = {
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  };

  selectedCourses: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private courseService: CourseService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadUsers();
    this.loadInternshipPrograms(); 
  }

  /**
   * Seleciona um usuário para ver os cursos concluídos
   * @param userIndex Índice do usuário selecionado
   */
  selectUser(userIndex: number) {
    this.selectedUserIndex = userIndex;
    this.loadCompletedCourses(this.users[userIndex].id);
    this.loadInternPrograms(this.users[userIndex].id);
  }

  /**
   * Seleciona um programa de estágio para ver os cursos associados
   * @param programIndex Índice do programa selecionado
   */
  selectProgram(programIndex: number) {
    this.selectedProgramIndex = programIndex;
    this.loadProgramCourses(this.internshipPrograms[programIndex].id);
  }

  /**
   * Carrega todos os cursos
   */
  loadCourses() {
    this.loading = true;
    this.error = '';

    this.courseService.getCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  loadCompletedCourses(userId: string) {
    this.loading = true;
    this.completedCourses = []; // Limpa os cursos concluídos antes de carregar novos 
    this.courseService.getCompletedCourses(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (courses) => {
          console.log('Cursos concluídos carregados:', courses);
          this.completedCourses = courses;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar cursos concluídos:', error);
          this.error = 'Erro ao carregar cursos concluídos. Tente novamente.';
          this.loading = false;
        }
      });
  }

  /**
   * Carrega todos os usuários
   */
  loadUsers() {
    this.loadingUsers = true;
    this.userError = '';

    this.userService.getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          console.log('Usuários carregados:', users);
          this.users = users;
          this.loadingUsers = false;
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);
          this.userError = 'Erro ao carregar usuários. Tente novamente.';
          this.loadingUsers = false;
        }
      });
  }

  loadInternshipPrograms(): void {
    const mentorId = localStorage.getItem('uuid');
    
    if (!mentorId) {
      console.error('ID do mentor não encontrado no localStorage');
      this.programError = 'ID do mentor não encontrado';
      return;
    }

    this.loadingPrograms = true;
    this.programError = '';

    fetch(`http://localhost:8080/api/internship/mentor/${mentorId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar programas de estágio');
        }
        return response.json();
      })
      .then((programs: InternshipProgram[]) => {
        console.log('Programas de estágio carregados:', programs);
        this.internshipPrograms = programs;
        this.loadingPrograms = false;
      })
      .catch(error => {
        console.error('Erro ao carregar programas:', error);
        this.programError = 'Erro ao carregar programas de estágio. Tente novamente.';
        this.loadingPrograms = false;
      });
  }

  /**
   * Cria um novo curso
   */
  createCourse() {
    if (!this.newCourse.title || !this.newCourse.description) {
      alert('Por favor, preencha todos os campos do curso.');
      return;
    }

    this.loading = true;
    this.error = '';

    this.courseService.createCourse(this.newCourse)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (course) => {
          console.log('Curso criado com sucesso:', course);
          this.courses.push(course);
          this.newCourse = { title: '', description: '' }; // Limpa o formulário
          this.loading = false;
          this.loadCourses(); // Recarrega a lista de cursos
        },
        error: (error) => {
          console.error('Erro ao criar curso:', error);
          this.error = 'Erro ao criar curso. Tente novamente.';
          this.loading = false;
        }
      });

  }

  /**
   * Exclui um curso
   */
  deleteCourse(courseId: string) {
    if (!confirm('Tem certeza que deseja excluir este curso?')) {
      return;
    }

    this.courseService.deleteCourse(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Curso excluído com sucesso');
          this.courses = this.courses.filter(course => course.id !== courseId);
        },
        error: (error) => {
          console.error('Erro ao excluir curso:', error);
          this.error = 'Erro ao excluir curso. Tente novamente.';
          
          // Remove a mensagem de erro após 3 segundos
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      });
  }

  /**
   * Exclui um programa de estágio
   */
  deleteInternshipProgram(programId: string, index: number): void {
    if (!confirm('Tem certeza que deseja excluir este programa de estágio?')) {
      return;
    }

    // Atualiza o estado de loading para este programa específico
    this.loadingPrograms = true;

    fetch(`http://localhost:8080/api/internship/${programId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao excluir programa de estágio');
      }
      
      console.log('Programa de estágio excluído com sucesso');
      
      // Remove o programa da lista local
      this.internshipPrograms.splice(index, 1);
      
      this.loadingPrograms = false;
      
      this.loadInternshipPrograms();
      
      this.selectedProgramIndex = null; 
    })
    .catch(error => {
      console.error('Erro ao excluir programa:', error);
      this.programError = 'Erro ao excluir programa de estágio. Tente novamente.';
      this.loadingPrograms = false;
      
      // Remove a mensagem de erro após 3 segundos
      setTimeout(() => {
        this.programError = '';
      }, 3000);
    });
  }

  // Logout do usuário
  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']);
  }

  // Adicione este método
  toggleCourseSelection(courseId: string): void {
    const index = this.selectedCourses.indexOf(courseId);
    if (index === -1) {
      // Adiciona o curso se não estiver selecionado
      this.selectedCourses.push(courseId);
    } else {
      // Remove o curso se já estiver selecionado
      this.selectedCourses.splice(index, 1);
    }
    console.log('Cursos selecionados:', this.selectedCourses);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  /**
   * Define a aba ativa
   * @param tab Nome da aba a ser ativada
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'track') {
      this.loadInternshipPrograms();
    }
    if (tab === 'mentoria') {
      this.loadInternshipPrograms();
      this.loadUsers();
    }
  }

  createInternshipProgram(): void {
    const mentorId = localStorage.getItem('uuid');

    if (!mentorId) {
      console.error('ID do mentor não encontrado no localStorage');
      return;
    }

    const programData = {
      title: this.newInternshipProgram.title,
      description: this.newInternshipProgram.description,
      startDate: this.newInternshipProgram.startDate,
      endDate: this.newInternshipProgram.endDate,
      mentorId: mentorId
    };

    fetch('http://localhost:8080/api/internship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(programData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao criar programa de estágio');
      }
      return response.json(); 
    })
    .then(data => {
      const newInternshipId = data.message; 

      console.log('Programa de estágio criado com sucesso!');
      console.log('Novo ID do programa de estágio:', newInternshipId);

      // Limpar o formulário
      this.newInternshipProgram = {
        title: '',
        description: '',
        startDate: '',
        endDate: ''
      };

      // Associar os cursos selecionados ao novo programa (se houver)
      if (this.selectedCourses.length > 0) {
        const associationPromises = this.selectedCourses.map(courseId => 
          fetch(`http://localhost:8080/api/internship/${newInternshipId}/course/${courseId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          })
        );

        Promise.all(associationPromises)
          .then(() => {
            console.log('Todos os cursos foram associados com sucesso');
            // Recarregar a lista de programas
            this.loadInternshipPrograms();
          })
          .catch(error => {
            console.error('Erro ao associar alguns cursos:', error);
          });
      } else {
        // Se não há cursos selecionados, apenas recarrega a lista de programas
        this.loadInternshipPrograms();
      }

      // Resetar cursos selecionados
      this.selectedCourses = [];

    })
    .catch(error => {
      console.error('Erro:', error);
    });
  }

  /**
   * Carrega os cursos de um programa de estágio específico
   * @param programId ID do programa de estágio
   */
  loadProgramCourses(programId: string) {
    this.loadingProgramCourses = true;
    this.programCoursesError = '';
    this.programCourses = [];

    fetch(`http://localhost:8080/api/internship/${programId}/courses`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar cursos do programa');
        }
        return response.json();
      })
      .then((courses: Course[]) => {
        console.log('Cursos do programa carregados:', courses);
        this.programCourses = courses;
        this.loadingProgramCourses = false;
      })
      .catch(error => {
        console.error('Erro ao carregar cursos do programa:', error);
        this.programCoursesError = 'Erro ao carregar cursos do programa. Tente novamente.';
        this.loadingProgramCourses = false;
      });
  }

  /**
   * Remove um curso de um programa de estágio
   * @param courseId ID do curso a ser removido
   * @param programId ID do programa de estágio
   */
  removeCourseFromProgram(courseId: string, programId: string) {
    if (!confirm('Tem certeza que deseja remover este curso do programa?')) {
      return;
    }

    fetch(`http://localhost:8080/api/internship/${programId}/course/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao remover curso do programa');
      }
      
      console.log('Curso removido do programa com sucesso');
      
      // Remove o curso da lista local
      this.programCourses = this.programCourses.filter(course => course.id !== courseId);
    })
    .catch(error => {
      console.error('Erro ao remover curso do programa:', error);
      this.programCoursesError = 'Erro ao remover curso do programa. Tente novamente.';
      
      // Remove a mensagem de erro após 3 segundos
      setTimeout(() => {
        this.programCoursesError = '';
      }, 3000);
    });
  }

  addSelectedCoursesToProgram(programId: string): void {
    if (this.selectedCourses.length === 0) {
      alert('Por favor, selecione pelo menos um curso para adicionar ao programa.');
      return;
    }

   
    for (const courseId of this.selectedCourses) {
      fetch(`http://localhost:8080/api/internship/${programId}/course/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao associar curso ao programa');
        }
        console.log(`Curso ${courseId} associado ao programa ${programId} com sucesso`);
        this.loadProgramCourses(programId); // Recarrega os cursos do programa após a associação
        this.selectedCourses = []; // Limpa a seleção de cursos após a adição
      })
      .catch(error => {
        console.error(`Erro ao associar curso ${courseId} ao programa ${programId}:`, error);
      });
    }
  }

  /**
   * Atribui um estagiário ao programa selecionado
   */
  assignInternToProgram(): void {
    if (this.selectedProgramIndex === null || this.selectedUserIndex === null) {
      alert('Por favor, selecione um programa e um estagiário.');
      return;
    }

    const program = this.internshipPrograms[this.selectedProgramIndex];
    const user = this.users[this.selectedUserIndex];

    console.log(`Atribuindo estagiário ${user.id} ao programa ${program.id}`);

    fetch(`http://localhost:8080/api/internship/${program.id}/intern/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao atribuir estagiário ao programa');
      }
      console.log(`Estagiário ${user.email} atribuído ao programa ${program.title} com sucesso`);
      alert(`Estagiário ${user.email} atribuído ao programa ${program.title} com sucesso!`);
    })
    .catch(error => {
      console.error('Erro ao atribuir estagiário ao programa:', error);
      alert('Erro ao atribuir estagiário ao programa. Tente novamente.');
    });
  }

  /**
   * Carrega os programas de estágio do estagiário
   * @param userId ID do usuário/estagiário
   */
  loadInternPrograms(userId: string): void {
    this.loadingInternPrograms = true;
    this.internProgramsError = '';
    this.internPrograms = [];
    this.currentMentorPrograms = [];
    this.otherMentorsPrograms = [];

    // Obter o UUID do mentor atual do localStorage
    const currentMentorId = localStorage.getItem('uuid');

    // Simular API call - substituir pela chamada real da API
    fetch(`http://localhost:8080/api/internship/intern/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar programas do estagiário');
        }
        return response.json();
      })
      .then((programs: InternshipProgram[]) => {
        console.log('Programas do estagiário carregados:', programs);
        this.internPrograms = programs;
        
        // Separar programas do mentor atual dos demais
        if (currentMentorId) {
          this.currentMentorPrograms = programs.filter(program => program.mentorId === currentMentorId);
          this.otherMentorsPrograms = programs.filter(program => program.mentorId !== currentMentorId);
        } else {
          // Se não houver mentor ID, todos os programas são considerados de outros mentores
          this.currentMentorPrograms = [];
          this.otherMentorsPrograms = programs;
        }
        
        console.log('Programas do mentor atual:', this.currentMentorPrograms);
        console.log('Programas de outros mentores:', this.otherMentorsPrograms);
        
        this.loadingInternPrograms = false;
      })
      .catch(error => {
        console.error('Erro ao carregar programas do estagiário:', error);
        this.internProgramsError = 'Erro ao carregar programas do estagiário. Tente novamente.';
        this.loadingInternPrograms = false;
      });
  }

  /**
   * Verifica se um programa está ativo (baseado na data atual)
   * @param program Programa de estágio
   */
  isProgramActive(program: InternshipProgram): boolean {
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    
    return now >= startDate && now <= endDate;
  }

  /**
   * Retorna o status do programa (Ativo, Finalizado, Futuro)
   * @param program Programa de estágio
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
   * Seleciona um programa de estagiário e carrega seus cursos
   * @param programId ID do programa selecionado
   */
  selectInternProgram(programId: string): void {
    if (this.selectedInternProgramId === programId) {
      // Se o mesmo programa foi clicado, deseleciona
      this.selectedInternProgramId = null;
      this.selectedInternProgramCourses = [];
      this.completedCoursesByIntern.clear();
      return;
    }

    this.selectedInternProgramId = programId;
    this.loadInternProgramCourses(programId);
  }

  /**
   * Carrega os cursos de um programa específico e os cursos concluídos pelo estagiário
   * @param programId ID do programa
   */
  loadInternProgramCourses(programId: string): void {
    if (this.selectedUserIndex === null) {
      console.error('Nenhum estagiário selecionado');
      return;
    }

    const internId = this.users[this.selectedUserIndex].id;
    
    this.loadingInternProgramCourses = true;
    this.internProgramCoursesError = '';
    this.selectedInternProgramCourses = [];
    this.completedCoursesByIntern.clear();

    // Carrega cursos do programa
    const programCoursesPromise = fetch(`http://localhost:8080/api/internship/${programId}/courses`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar cursos do programa');
        }
        return response.json();
      });

    // Carrega cursos concluídos pelo estagiário
    const completedCoursesPromise = this.courseService.getCompletedCourses(internId)
      .toPromise()
      .catch(error => {
        console.warn('Erro ao carregar cursos concluídos, continuando sem eles:', error);
        return [];
      });

    // Executa ambas as requisições em paralelo
    Promise.all([programCoursesPromise, completedCoursesPromise])
      .then(([programCourses, completedCourses]) => {
        console.log('Cursos do programa carregados:', programCourses);
        console.log('Cursos concluídos pelo estagiário:', completedCourses);
        
        this.selectedInternProgramCourses = programCourses || [];
        
        // Cria set com IDs dos cursos concluídos para lookup rápido
        if (completedCourses && Array.isArray(completedCourses)) {
          this.completedCoursesByIntern = new Set(completedCourses.map((course: Course) => course.id));
        }
        
        this.loadingInternProgramCourses = false;
      })
      .catch(error => {
        console.error('Erro ao carregar dados do programa:', error);
        this.internProgramCoursesError = 'Erro ao carregar cursos do programa. Tente novamente.';
        this.loadingInternProgramCourses = false;
      });
  }

  /**
   * Verifica se um curso foi concluído pelo estagiário selecionado
   * @param courseId ID do curso
   */
  isCourseCompletedByIntern(courseId: string): boolean {
    return this.completedCoursesByIntern.has(courseId);
  }

  /**
   * Obtém os cursos concluídos pelo estagiário do programa selecionado
   */
  getCompletedCoursesForProgram(): Course[] {
    return this.selectedInternProgramCourses.filter(course => 
      this.isCourseCompletedByIntern(course.id)
    );
  }

  /**
   * Obtém os cursos não concluídos pelo estagiário do programa selecionado
   */
  getPendingCoursesForProgram(): Course[] {
    return this.selectedInternProgramCourses.filter(course => 
      !this.isCourseCompletedByIntern(course.id)
    );
  }

  /**
   * Calcula a porcentagem de progresso do estagiário no programa selecionado
   */
  getProgressPercentage(): number {
    if (this.selectedInternProgramCourses.length === 0) {
      return 0;
    }
    return Math.round((this.getCompletedCoursesForProgram().length / this.selectedInternProgramCourses.length) * 100);
  }
}
