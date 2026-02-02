import { Component, OnInit } from '@angular/core';
import { CoursesService, Course } from '../../../../core/courses/courses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  error = '';
  success = '';

  // criar
  title = '';
  description = '';
  imageUrl = '';

  // editar
  editingId: string | null = null;
  editTitle = '';
  editDescription = '';
  editImageUrl = '';

  constructor(private coursesApi: CoursesService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.coursesApi.list().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        console.log('LOAD COURSES ERROR =>', err);
        this.error = 'Erro ao carregar cursos';
        this.loading = false;
      },
    });
  }

  create() {
    this.error = '';
    this.success = '';

    if (!this.title.trim()) {
      this.error = 'Título é obrigatório';
      return;
    }

    this.coursesApi
      .create({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        imageUrl: this.imageUrl.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.title = '';
          this.description = '';
          this.imageUrl = '';
          this.success = 'Curso cadastrado com sucesso!';
          this.load();
        },
        error: (err) => {
          console.log('CREATE COURSE ERROR =>', err);
          this.error = 'Erro ao criar curso';
        },
      });
  }

  startEdit(course: Course) {
    this.editingId = course.id;
    this.editTitle = course.title || '';
    this.editDescription = course.description || '';
    this.editImageUrl = (course as any).imageUrl || ''; // caso seu type ainda não tenha
    this.error = '';
    this.success = '';
  }

  cancelEdit() {
    this.editingId = null;
    this.editTitle = '';
    this.editDescription = '';
    this.editImageUrl = '';
  }

  saveEdit() {
    if (!this.editingId) return;

    this.error = '';
    this.success = '';

    if (!this.editTitle.trim()) {
      this.error = 'Título é obrigatório';
      return;
    }

    this.coursesApi
      .update(this.editingId, {
        title: this.editTitle.trim(),
        description: this.editDescription.trim() || undefined,
        imageUrl: this.editImageUrl.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.success = 'Curso atualizado com sucesso!';
          this.cancelEdit();
          this.load();
        },
        error: (err) => {
          console.log('UPDATE COURSE ERROR =>', err);
          this.error = 'Erro ao atualizar curso';
        },
      });
  }

  deactivate(course: Course) {
    const ok = confirm(`Deseja desativar o curso "${course.title}"?`);
    if (!ok) return;

    this.error = '';
    this.success = '';

    this.coursesApi.deactivate(course.id).subscribe({
      next: () => {
        this.success = 'Curso desativado!';
        this.load();
      },
      error: (err) => {
        console.log('DEACTIVATE COURSE ERROR =>', err);
        this.error = 'Erro ao desativar curso';
      },
    });
  }
}
