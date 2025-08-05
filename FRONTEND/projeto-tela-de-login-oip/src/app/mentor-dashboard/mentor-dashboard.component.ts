import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course, CreateCourseRequest } from '../services/course.service';
import { UserService, User } from '../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent implements OnInit {
  courses: Course[] = [];
  completedCourses: Course[] = [];

  selectedUserIndex: number | null = null;
  users: User[] = [];
  loading = false;
  loadingUsers = false;
  error = '';
  userError = '';

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
  }

  /**
   * Seleciona um usuário para ver os cursos concluídos
   * @param userIndex Índice do usuário selecionado
   */
  selectUser(userIndex: number) {
    this.selectedUserIndex = userIndex;
    this.loadCompletedCourses(this.users[userIndex].id);
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

  // Logout do usuário
  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']);
  }

  // Adicione este método
  setActiveTab(tab: string): void {
    this.activeTab = tab;
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

      // Associar os cursos ao novo programa
      for (const courseId of this.selectedCourses) {
        fetch(`http://localhost:8080/api/internship/${newInternshipId}/course/${courseId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then(courseResponse => {
          if (!courseResponse.ok) {
            throw new Error('Erro ao associar curso ao programa de estágio');
          }
        })
        .catch(error => {
          console.error('Erro ao associar curso:', error);
        });
      }

      // Resetar cursos selecionados
      this.selectedCourses = [];

    })
    .catch(error => {
      console.error('Erro:', error);
    });
  }
}
