import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Course = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;

  // ✅ progresso real vindo do backend
  totalLessons?: number;
  completedLessons?: number;
  progressPercent?: number;

  // ✅ NOVO: prova vinculada ao curso
  hasExam?: boolean;
  examId?: string | null;
  examTitle?: string | null;
  examUnlocked?: boolean;
};

@Injectable({ providedIn: 'root' })
export class StudentCoursesService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // ✅ aluno logado
  listMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${this.baseUrl}/students/me/courses`,
      this.authHeaders(),
    );
  }

  // ✅ opcional: mantém pra admin/demos
  listByStudent(studentId: string): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${this.baseUrl}/students/${studentId}/courses`,
      this.authHeaders(),
    );
  }
}
