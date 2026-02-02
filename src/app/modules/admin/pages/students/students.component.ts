import { Component, OnInit } from '@angular/core';
import {
  StudentsService,
  Student,
} from '../../../../core/students/students.service';
import {
  CoursesService,
  Course,
} from '../../../../core/courses/courses.service';

@Component({
  selector: 'app-admin-students',
  templateUrl: './students.component.html', // ✅ corrigido (tinha vírgula dupla)
})
export class StudentsComponent implements OnInit {
  loading = false;
  error = '';
  success = '';

  students: Student[] = [];

  // cursos para dropdown
  courses: Course[] = [];

  // estado do dropdown por aluno
  selectedCourseByStudent: Record<string, string> = {};

  // =========================
  // ✅ MODAL CADASTRO MANUAL
  // =========================
  showCreateModal = false;
  creating = false;

  formFullName = '';
  formEmail = '';
  formCompanyId = ''; // por enquanto fica vazio (empresa opcional)
  formCourseId = ''; // curso inicial opcional

  constructor(private api: StudentsService, private coursesApi: CoursesService) {}

  ngOnInit() {
    this.loadAll();
  }

  /**
   * Carrega:
   * - cursos (pra dropdown de matrícula)
   * - alunos (lista)
   */
  loadAll() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.coursesApi.list().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: () => {
        this.courses = [];
      },
    });

    this.api.list().subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: (err) => {
        console.log('LOAD STUDENTS ERROR =>', err);
        this.error = 'Erro ao carregar alunos';
        this.loading = false;
      },
    });
  }

  reloadStudentsOnly() {
    this.api.list().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: () => {
        this.error = 'Erro ao recarregar alunos';
      },
    });
  }

  // =========================
  // ✅ MODAL: abrir/fechar
  // =========================
  openCreateModal() {
    this.error = '';
    this.success = '';

    this.showCreateModal = true;
    this.creating = false;

    // limpa form
    this.formFullName = '';
    this.formEmail = '';
    this.formCompanyId = '';
    this.formCourseId = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  /**
   * Cria aluno manualmente:
   * 1) cria aluno
   * 2) se courseId vier, matricula
   */
  createStudent() {
    const name = this.formFullName.trim();
    const email = this.formEmail.trim();

    this.error = '';
    this.success = '';

    if (!name) {
      this.error = 'Nome é obrigatório';
      return;
    }
    if (!email) {
      this.error = 'Email é obrigatório';
      return;
    }

    this.creating = true;

    this.api
      .createAndMaybeEnroll({
        fullName: name,
        email,
        companyId: this.formCompanyId || null,
        courseId: this.formCourseId || null,
      })
      .subscribe({
        next: () => {
          this.success = 'Aluno criado com sucesso!';
          this.closeCreateModal();
          this.reloadStudentsOnly();
          this.creating = false;
        },
        error: (err) => {
  console.log('CREATE STUDENT ERROR =>', err);

  const msg =
    err?.error?.message ||
    err?.message ||
    'Erro ao criar aluno';

  // se vier array (às vezes validação manda array)
  this.error = Array.isArray(msg) ? msg.join(' | ') : msg;

  this.creating = false;
},
      });
  }

  // =========================
  // ✅ AÇÕES EXISTENTES
  // =========================
  deactivate(student: Student) {
    const ok = confirm(`Deseja desativar o aluno "${student.fullName}"?`);
    if (!ok) return;

    this.error = '';
    this.success = '';

    this.api.deactivate(student.id).subscribe({
      next: () => {
        this.success = 'Aluno desativado!';
        this.reloadStudentsOnly();
      },
      error: (err) => {
        console.log('DEACTIVATE STUDENT ERROR =>', err);
        this.error = 'Erro ao desativar aluno';
      },
    });
  }

  enroll(student: Student) {
    const courseId = this.selectedCourseByStudent[student.id];
    if (!courseId) {
      this.error = 'Selecione um curso para matricular';
      return;
    }

    this.error = '';
    this.success = '';

    this.api.enroll(student.id, courseId).subscribe({
      next: () => {
        this.success = 'Aluno matriculado no curso!';
        this.selectedCourseByStudent[student.id] = '';
        this.reloadStudentsOnly();
      },
      error: (err) => {
        console.log('ENROLL ERROR =>', err);
        this.error = 'Erro ao matricular aluno';
      },
    });
  }

  unenroll(student: Student, courseId: string) {
    const ok = confirm(`Remover matrícula de "${student.fullName}" deste curso?`);
    if (!ok) return;

    this.error = '';
    this.success = '';

    this.api.unenroll(student.id, courseId).subscribe({
      next: () => {
        this.success = 'Matrícula removida!';
        this.reloadStudentsOnly();
      },
      error: (err) => {
        console.log('UNENROLL ERROR =>', err);
        this.error = 'Erro ao remover matrícula';
      },
    });
  }
}
