import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export type Course = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
};

/**
 * ✅ Tipagem da árvore do curso
 * Curso -> Módulos -> Aulas
 */
export type CourseTree = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      videoUrl?: string | null;
    }[];
  }[];
};

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.token}`,
      }),
    };
  }

  list(): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${this.baseUrl}/courses`,
      this.authHeaders(),
    );
  }

  create(data: {
    title: string;
    description?: string;
    imageUrl?: string;
  }): Observable<Course> {
    return this.http.post<Course>(
      `${this.baseUrl}/courses`,
      data,
      this.authHeaders(),
    );
  }

  /**
   * ✅ GET /courses/:id/tree
   */
  getTree(courseId: string): Observable<CourseTree> {
    return this.http.get<CourseTree>(
      `${this.baseUrl}/courses/${courseId}/tree`,
      this.authHeaders(),
    );
  }


/** PATCH /courses/:id */
  update(
    id: string,
    data: { title?: string; description?: string; imageUrl?: string; isActive?: boolean },
  ): Observable<Course> {
    return this.http.patch<Course>(
      `${this.baseUrl}/courses/${id}`,
      data,
      this.authHeaders(),
    );
  }

  /** DELETE /courses/:id (soft delete no backend) */
  deactivate(id: string): Observable<Course> {
    return this.http.delete<Course>(
      `${this.baseUrl}/courses/${id}`,
      this.authHeaders(),
    );
  }
}
