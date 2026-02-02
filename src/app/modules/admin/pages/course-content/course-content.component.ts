import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursesService, CourseTree } from '../../../../core/courses/courses.service';
import { CourseModulesService } from '../../../../modules/course-module.service';
import { LessonsService } from '../../../../core/lessons/lessons.service';

@Component({
  selector: 'app-course-content',
  templateUrl: './course-content.component.html',
})
export class CourseContentComponent implements OnInit {
  loading = true;
  error = '';

  courseId = '';
  courseTree: CourseTree | null = null;

  // ✅ form criar módulo
  showCreateModule = false;
  moduleTitle = '';
  moduleOrder = 1;

  // ✅ form criar aula (por módulo)
  showCreateLessonForModuleId: string | null = null;
  lessonTitle = '';
  lessonOrder = 1;
  lessonVideoUrl = '';

  constructor(
    private route: ActivatedRoute,
    private coursesApi: CoursesService,
    private modulesApi: CourseModulesService,
    private lessonsApi: LessonsService,
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loadTree();
  }

  /**
   * Carrega a árvore completa do curso (curso -> módulos -> aulas)
   * Já vem ordenado do backend.
   */
  loadTree() {
    this.loading = true;
    this.error = '';

    this.coursesApi.getTree(this.courseId).subscribe({
      next: (data) => {
        this.courseTree = data;
        this.loading = false;

        // sugestão: próximo order de módulo = último + 1
        const lastOrder = (data.modules?.[data.modules.length - 1]?.order ?? 0);
        this.moduleOrder = lastOrder + 1;
      },
      error: (err) => {
        console.log(err);
        this.error = 'Erro ao carregar conteúdo do curso';
        this.loading = false;
      },
    });
  }

  // =======================
  //  MÓDULOS (create)
  // =======================

  openCreateModule() {
    this.showCreateModule = true;
    this.moduleTitle = '';
    // mantém moduleOrder sugerido
  }

  cancelCreateModule() {
    this.showCreateModule = false;
    this.moduleTitle = '';
  }

  createModule() {
    this.error = '';

    const title = this.moduleTitle.trim();
    if (!title) {
      this.error = 'Título do módulo é obrigatório';
      return;
    }

    this.modulesApi
      .create({
        title,
        courseId: this.courseId,
        order: Number(this.moduleOrder),
      })
      .subscribe({
        next: () => {
          this.showCreateModule = false;
          this.moduleTitle = '';
          this.loadTree();
        },
        error: (err) => {
          console.log(err);
          this.error = 'Erro ao criar módulo';
        },
      });
  }

  // =======================
  //  AULAS (create)
  // =======================

  openCreateLesson(moduleId: string) {
    this.showCreateLessonForModuleId = moduleId;
    this.lessonTitle = '';
    this.lessonVideoUrl = '';

    // sugestão: próximo order de aula = último + 1
    const mod = this.courseTree?.modules?.find((m: any) => m.id === moduleId);
    const lastLessonOrder = (mod?.lessons?.[mod.lessons.length - 1]?.order ?? 0);
    this.lessonOrder = lastLessonOrder + 1;
  }

  cancelCreateLesson() {
    this.showCreateLessonForModuleId = null;
    this.lessonTitle = '';
    this.lessonVideoUrl = '';
  }

  createLesson(moduleId: string) {
    this.error = '';

    const title = this.lessonTitle.trim();
    const videoUrl = this.lessonVideoUrl.trim();

    if (!title) {
      this.error = 'Título da aula é obrigatório';
      return;
    }

    // validação simples de URL (opcional)
    if (videoUrl && !/^https?:\/\/.+/i.test(videoUrl)) {
      this.error = 'O link do vídeo precisa ser uma URL válida (http/https)';
      return;
    }

    this.lessonsApi
      .create({
        title,
        moduleId,
        order: Number(this.lessonOrder),
        videoUrl: videoUrl || undefined,
      })
      .subscribe({
        next: () => {
          this.cancelCreateLesson();
          this.loadTree();
        },
        error: (err) => {
          console.log(err);
          this.error = 'Erro ao criar aula';
        },
      });
  }
}
