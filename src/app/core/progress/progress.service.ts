import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/* =========================
   TIPAGENS EXPORTADAS
========================= */

export type LessonNode = {
  id: string;
  title: string;
  order: number;
  videoUrl?: string | null;
  completed: boolean;
  locked: boolean;

  watchedSeconds?: number;
  lastPosition?: number;
};

export type ModuleNode = {
  id: string;
  title: string;
  order: number;
  lessons: LessonNode[];
};

export type CourseProgressTree = {
  id: string;
  title: string;
  description?: string | null;
  modules: ModuleNode[];
};

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders() {
    const token = this.auth.token || localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  /**
   * ✅ ALUNO LOGADO
   * GET /progress/me/course/:courseId
   */
  getMyCourseProgress(courseId: string): Observable<CourseProgressTree> {
    return this.http.get<CourseProgressTree>(
      `${this.baseUrl}/progress/me/course/${courseId}`,
      this.authHeaders(),
    );
  }

  /**
   * ✅ ALUNO LOGADO
   * POST /progress/me/complete
   */
  completeMyLesson(lessonId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/progress/me/complete`,
      { lessonId },
      this.authHeaders(),
    );
  }

  watchMyLesson(lessonId: string, currentTime: number, duration: number): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/progress/me/watch`,
    { lessonId, currentTime, duration },
    this.authHeaders(),
  );
}

  /* =========================
     (Opcional) ADMIN/MANAGER
     Mantém seus métodos antigos
     se você ainda usa em telas administrativas
  ========================= */

  getCourseProgressByStudent(
    studentId: string,
    courseId: string,
  ): Observable<CourseProgressTree> {
    return this.http.get<CourseProgressTree>(
      `${this.baseUrl}/progress/${studentId}/course/${courseId}`,
      this.authHeaders(),
    );
  }
}
