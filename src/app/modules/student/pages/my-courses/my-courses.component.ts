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

  constructor(
    private api: StudentCoursesService,
    private router: Router,
  ) {}

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
    this.router.navigate(['/aluno/curso', course.id]);
  }
}
