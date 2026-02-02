import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Observable } from 'rxjs';

export type CourseModule = {
  id: string;
  title: string;
  order: number;
  courseId: string;
};

@Injectable({ providedIn: 'root' })
export class CourseModulesService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.token}`,
      }),
    };
  }

  /** GET /modules?courseId=xxx */
  listByCourse(courseId: string): Observable<CourseModule[]> {
    return this.http.get<CourseModule[]>(
      `${this.baseUrl}/modules?courseId=${courseId}`,
      this.authHeaders(),
    );
  }

  /** POST /modules */
  create(data: { title: string; courseId: string; order: number }): Observable<CourseModule> {
    return this.http.post<CourseModule>(
      `${this.baseUrl}/modules`,
      data,
      this.authHeaders(),
    );
  }
}
