import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursesService, CourseTree } from '../../../../core/courses/courses.service';
import { ProgressService } from '../../../../core/progress/progress.service';

@Component({
  selector: 'app-course-view',
  templateUrl: './course-view.component.html',
})
export class CourseViewComponent implements OnInit {
  courseId = '';
  course: CourseTree | null = null;
  loading = true;
  error = '';

  // simulação simples de progresso local (depois vem do backend)
  completedLessonIds = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private coursesApi: CoursesService,
    private progressApi: ProgressService,
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loadCourse();
  }

  loadCourse() {
    this.loading = true;
    this.coursesApi.getTree(this.courseId).subscribe({
      next: (data) => {
        this.course = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar curso';
        this.loading = false;
      },
    });
  }

  /** regra simples:
   * aula liberada = primeira aula OU aula anterior concluída
   */
  isLessonUnlocked(moduleIndex: number, lessonIndex: number): boolean {
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    if (!this.course) return false;

    if (lessonIndex > 0) {
      const prev = this.course.modules[moduleIndex].lessons[lessonIndex - 1];
      return this.completedLessonIds.has(prev.id);
    }

    const prevModule = this.course.modules[moduleIndex - 1];
    const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
    return this.completedLessonIds.has(lastLesson.id);
  }

  isCompleted(lessonId: string) {
    return this.completedLessonIds.has(lessonId);
  }

  completeLesson(lessonId: string) {
    this.progressApi.completeMyLesson(lessonId).subscribe({
      next: () => {
        this.completedLessonIds.add(lessonId);
      },
      error: () => {
        this.error = 'Erro ao concluir aula';
      },
    });
  }
}
