import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CoursesTreeService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getTree(courseId: string) {
    return this.http.get<any>(`${this.baseUrl}/courses/${courseId}/tree`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.token}`,
      }),
    });
  }
}
