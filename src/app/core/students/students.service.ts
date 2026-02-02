import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export type StudentCourse = {
  course: {
    id: string;
    title: string;
  };
};

export type CreateStudentPayload = {
  fullName: string;
  email: string;
  companyId?: string | null;
  courseId?: string | null; // para matricular logo após criar
};

export type Student = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  company?: {
    id: string;
    name: string;
  };
  courses: StudentCourse[];
};

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

 private authHeaders() {
  const token = this.auth?.token || localStorage.getItem('token') || '';
  return {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`,
    }),
  };
}

  /** GET /students */
  list(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students`, this.authHeaders());
  }

  /** DELETE /students/:id (soft delete) */
  deactivate(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/${id}`, this.authHeaders());
  }

    /** POST /students */
  create(data: { fullName: string; email: string; companyId?: string | null }) {
    return this.http.post<any>(`${this.baseUrl}/students`, data, this.authHeaders());
  }

  /**
   * Criação completa:
   * 1) cria aluno
   * 2) se courseId vier, matricula
   */
  createAndMaybeEnroll(payload: CreateStudentPayload) {
    return new Observable((observer) => {
      this.create({
        fullName: payload.fullName,
        email: payload.email,
        companyId: payload.companyId || undefined,
      }).subscribe({
        next: (created) => {
          if (!payload.courseId) {
            observer.next(created);
            observer.complete();
            return;
          }

          this.enroll(created.id, payload.courseId).subscribe({
            next: () => {
              observer.next(created);
              observer.complete();
            },
            error: (err) => observer.error(err),
          });
        },
        error: (err) => observer.error(err),
      });
    });
  }


   /** POST /enrollments */
  enroll(studentId: string, courseId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/enrollments`,
      { studentId, courseId },
      this.authHeaders(),
    );
  }

  /** DELETE /enrollments */
  unenroll(studentId: string, courseId: string): Observable<any> {
    return this.http.request('delete', `${this.baseUrl}/enrollments`, {
      body: { studentId, courseId },
      ...this.authHeaders(),
    });
  }
}
