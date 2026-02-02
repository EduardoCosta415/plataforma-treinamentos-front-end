import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DashboardSummary,
  StudentsPerMonth,
  CourseProgress,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly baseUrl = 'http://localhost:3000/admin/dashboard';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  /** 🔹 Cards do topo */
  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${this.baseUrl}/summary`,
      this.authHeaders(),
    );
  }

  /** 🔹 Gráfico: alunos por mês */
  getStudentsPerMonth(months = 6): Observable<StudentsPerMonth[]> {
    return this.http.get<StudentsPerMonth[]>(
      `${this.baseUrl}/students-per-month?months=${months}`,
      this.authHeaders(),
    );
  }

  /** 🔹 Gráfico: progresso por curso */
  getCourseProgress(limit = 8): Observable<CourseProgress[]> {
    return this.http.get<CourseProgress[]>(
      `${this.baseUrl}/course-progress?limit=${limit}`,
      this.authHeaders(),
    );
  }
}
