import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Ajuste o caminho conforme seu projeto
import { environment } from 'src/environments/environment'; // Boas práticas: use environment

export interface MyCertificateItem {
  id: string;
  courseId: string;
  courseTitle: string;
  scorePercent: number;
  issuedAt: string; // ISO Date
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  Url = 'http://localhost:3000';
  private readonly apiUrl = `${this.Url}/students/me/certificates`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Helper para headers (Idealmente isso estaria num Interceptor, mas mantive aqui para garantir funcionamento)
  private getHeaders(): HttpHeaders {
    const token = this.auth.token || localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  listMyCertificates(): Observable<MyCertificateItem[]> {
    return this.http.get<MyCertificateItem[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Baixa o PDF.
   * Nota: responseType 'blob' é crucial para arquivos binários.
   */
  downloadCertificate(courseId: string): Observable<Blob> {
    const url = `${this.apiUrl}/${courseId}/download`;
    return this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }
}
