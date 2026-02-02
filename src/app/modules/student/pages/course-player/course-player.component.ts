import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ProgressService,
  CourseProgressTree,
  LessonNode,
  ModuleNode,
} from '../../../../core/progress/progress.service';

type VideoProgressEvent = { currentTime: number; duration: number };

@Component({
  selector: 'app-course-player',
  templateUrl: './course-player.component.html',
})
export class CoursePlayerComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';

  courseId = '';

  tree: CourseProgressTree | null = null;
  selectedLesson: LessonNode | null = null;

  completing = false;

  // =========================
  // VIDEO
  // =========================
  selectedVideoId: string | null = null;

  /** controla se o botão "Concluir" fica habilitado */
  canComplete = false;

  /** porcentagem mínima para liberar conclusão */
  private readonly COMPLETE_THRESHOLD_PERCENT = 99;

  // ✅ heartbeat
  private watchTimer: any = null;
  private lastSavedSecond = -1;

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  ngOnDestroy(): void {
    if (this.watchTimer) clearTimeout(this.watchTimer);
    this.watchTimer = null;
  }

  load(): void {
    if (!this.courseId) {
      this.error = 'Curso inválido';
      return;
    }

    this.loading = true;
    this.error = '';

    this.progress.getMyCourseProgress(this.courseId).subscribe({
      next: (data: CourseProgressTree) => {
        this.tree = data;

        const keepId = this.selectedLesson?.id || null;

        const keep = keepId ? this.findLessonById(data.modules, keepId) : null;

        const firstAvailable =
          keep && !keep.locked ? keep : this.findFirstUnlocked(data.modules);

        this.selectLesson(firstAvailable);

        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('LOAD PROGRESS ERROR =>', err);
        this.error = 'Erro ao carregar progresso do curso';
        this.loading = false;
      },
    });
  }

  selectLesson(lesson: LessonNode | null): void {
    // limpa timers do heartbeat ao trocar aula
    if (this.watchTimer) clearTimeout(this.watchTimer);
    this.watchTimer = null;
    this.lastSavedSecond = -1;

    this.selectedLesson = null;
    this.selectedVideoId = null;
    this.canComplete = false;

    if (!lesson) return;
    if (lesson.locked) return;

    this.selectedLesson = lesson;

    if (lesson.completed) {
      this.canComplete = true;
    }

    this.selectedVideoId = this.extractYoutubeId(lesson.videoUrl || null);

    if (!this.selectedVideoId && !lesson.completed) {
      this.canComplete = true;
    }
  }

  completeSelectedLesson(): void {
    const lesson = this.selectedLesson;
    if (!lesson) return;
    if (lesson.locked) return;
    if (lesson.completed) return;
    if (!this.canComplete) return;

    this.completing = true;
    this.error = '';

    this.progress.completeMyLesson(lesson.id).subscribe({
      next: () => {
        this.completing = false;
        this.load();
      },
      error: (err: unknown) => {
        console.error('COMPLETE ERROR =>', err);

        const msg = (err as any)?.error?.message || 'Erro ao concluir aula';
        this.error = msg;
        this.completing = false;
      },
    });
  }

  // =========================
  // Eventos do YouTube player
  // =========================
  onVideoProgress(ev: VideoProgressEvent): void {
    const lesson = this.selectedLesson;
    if (!lesson) return;
    if (!ev || !ev.duration || ev.duration <= 0) return;

    const percent = (ev.currentTime / ev.duration) * 100;
    if (percent >= this.COMPLETE_THRESHOLD_PERCENT) {
      this.canComplete = true;
    }

    // ✅ heartbeat a cada ~3s (sem spam)
    const sec = Math.floor(ev.currentTime);
    if (sec <= 0) return;
    if (sec === this.lastSavedSecond) return;

    // só salva de 3 em 3 segundos
    if (sec % 3 !== 0) return;

    this.lastSavedSecond = sec;

    // debounce leve para evitar rajadas
    if (this.watchTimer) clearTimeout(this.watchTimer);

    this.watchTimer = setTimeout(() => {
      // ainda é a mesma aula?
      if (!this.selectedLesson || this.selectedLesson.id !== lesson.id) return;

      this.progress
        .watchMyLesson(lesson.id, ev.currentTime, ev.duration)
        .subscribe({
          next: () => {
            // não precisamos fazer load() aqui (evita re-render e risco de jitter)
            // quando trocar aula ou recarregar página, o lastPosition virá do backend
          },
          error: (err: unknown) => {
            console.error('WATCH ERROR =>', err);
            // não trava o aluno; só loga
          },
        });
    }, 200);
  }

  onVideoEnded(): void {
    this.canComplete = true;

    // salva posição final também (boa prática)
    const lesson = this.selectedLesson;
    if (!lesson) return;

    // tenta salvar “fim” como lastPosition também
    this.progress.watchMyLesson(lesson.id, 999999, 999999).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  badgeFor(lesson: LessonNode): string {
    if (lesson.completed) return 'Concluída';
    if (lesson.locked) return 'Bloqueada';
    return 'Disponível';
  }

  // =========================
  // Helpers
  // =========================
  private findFirstUnlocked(modules: ModuleNode[]): LessonNode | null {
    return modules.flatMap((m) => m.lessons).find((l) => !l.locked) || null;
  }

  private findLessonById(modules: ModuleNode[], id: string): LessonNode | null {
    for (const m of modules) {
      const found = m.lessons.find((l) => l.id === id);
      if (found) return found;
    }
    return null;
  }

  private extractYoutubeId(url: string | null): string | null {
    if (!url) return null;
    const raw = url.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

    const short = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short?.[1]) return short[1];

    const watch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch?.[1]) return watch[1];

    const embed = raw.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed?.[1]) return embed[1];

    return null;
  }
}
