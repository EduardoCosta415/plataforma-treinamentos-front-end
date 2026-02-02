import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export type Company = {
  id: string;
  name: string;
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.token}`,
      }),
    };
  }

  list(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`, this.authHeaders());
  }

  create(data: { name: string; cnpj?: string; email?: string; phone?: string }): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, data, this.authHeaders());
  }
}
