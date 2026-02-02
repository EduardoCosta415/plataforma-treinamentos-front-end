import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export type Lesson = {
  id: string;
  title: string;
  order: number;
  moduleId: string;
  videoUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class LessonsService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.token}`,
      }),
    };
  }

  /** GET /lessons?moduleId=xxx */
  listByModule(moduleId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(
      `${this.baseUrl}/lessons?moduleId=${moduleId}`,
      this.authHeaders(),
    );
  }

  /** POST /lessons */
  create(data: { title: string; moduleId: string; order: number; videoUrl?: string }): Observable<Lesson> {
    return this.http.post<Lesson>(
      `${this.baseUrl}/lessons`,
      data,
      this.authHeaders(),
    );
  }
}
