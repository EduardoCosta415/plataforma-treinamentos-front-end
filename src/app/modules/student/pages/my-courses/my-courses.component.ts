import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  StudentCoursesService,
  Course,
} from '../../service/student-courses.service';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
})
export class MyCoursesComponent implements OnInit {
  loading = false;
  error = '';
  courses: Course[] = [];

  constructor(private api: StudentCoursesService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.api.listMyCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.log('LOAD MY COURSES ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao carregar seus cursos';
        this.loading = false;
      },
    });
  }

  open(course: Course): void {
    console.log('➡️ Tentando abrir curso:', course);

    // 1. Validação de segurança
    if (!course || !course.id) {
      console.error(
        '❌ ERRO: O curso não possui ID válido para navegação.',
        course
      );
      alert('Erro: Identificador do curso não encontrado.');
      return;
    }

    // 2. Navegação com tratamento de erro (Promise)
    // O caminho deve corresponder EXATAMENTE ao seu app-routing.module.ts
    this.router
      .navigate(['/aluno/curso', course.id])
      .then((success) => {
        if (success) {
          console.log('✅ Navegação iniciada com sucesso');
        } else {
          console.error(
            '⚠️ FALHA NA NAVEGAÇÃO: A rota "/aluno/curso/:id" existe?'
          );
          alert('Rota não encontrada. Verifique o console.');
        }
      })
      .catch((err) => {
        console.error('❌ Erro crítico no Router:', err);
      });
  }
}
