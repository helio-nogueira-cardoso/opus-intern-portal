import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course, CreateCourseRequest } from '../services/course.service';
import { UserService, User } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  users: User[] = [];
  loading = false;
  loadingUsers = false;
  error = '';
  userError = '';

  newCourse: CreateCourseRequest = {
    title: '',
    description: ''
  };
  
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private courseService: CourseService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadUsers();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Carrega todos os cursos
   */
  loadCourses() {
    this.loading = true;
    this.error = '';

    const coursesSub = this.courseService.getCourses().subscribe({
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

    this.subscription.add(coursesSub);
  }

  /**
   * Carrega todos os usuários
   */
  loadUsers() {
    this.loadingUsers = true;
    this.userError = '';

    const usersSub = this.userService.getUsers().subscribe({
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

    this.subscription.add(usersSub);
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

    const createSub = this.courseService.createCourse(this.newCourse).subscribe({
      next: (course) => {
        console.log('Curso criado com sucesso:', course);
        this.courses.push(course);
        this.newCourse = { title: '', description: '' }; // Limpa o formulário
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao criar curso:', error);
        this.error = 'Erro ao criar curso. Tente novamente.';
        this.loading = false;
      }
    });

    this.subscription.add(createSub);
  }

  /**
   * Exclui um curso
   */
  deleteCourse(courseId: string) {
    if (!confirm('Tem certeza que deseja excluir este curso?')) {
      return;
    }

    const deleteSub = this.courseService.deleteCourse(courseId).subscribe({
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

    this.subscription.add(deleteSub);
  }

  /**
   * Volta para a tela anterior
   */
  goBack() {
    this.router.navigate(['/welcome']);
  }
}
