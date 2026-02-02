import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

type LoginResponse = {
  access_token: string;
  mustChangePassword?: boolean;
  user: { id: string; email: string; fullName: string; role: string };
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ✅ Admin
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('must_change_password', String(!!res.mustChangePassword));
        }),
      );
  }

  // ✅ Aluno
  loginStudent(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/student/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('must_change_password', String(!!res.mustChangePassword));
        }),
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('must_change_password');
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get mustChangePassword(): boolean {
    return localStorage.getItem('must_change_password') === 'true';
  }

  get user(): any | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}
