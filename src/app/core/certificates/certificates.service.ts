import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export type AttemptHistoryItem = {
  id: string;
  attemptNumber: number;
  scorePercent: number | null;
  passed: boolean;
  startedAt: string;
  finishedAt: string | null;
};

export type MyCertificateItem = {
  id: string;
  courseId: string;
  courseTitle: string;
  scorePercent: number;
  issuedAt: string;
  attemptId?: string | null;

  // ✅ histórico
  courseCompletedAt?: string | null;
  attempts?: AttemptHistoryItem[];
};

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.token || localStorage.getItem('access_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listMyCertificates(): Observable<{ success: boolean; data: MyCertificateItem[] }> {
    return this.http.get<{ success: boolean; data: MyCertificateItem[] }>(
      `${this.baseUrl}/students/me/certificates`,
      { headers: this.authHeaders() },
    );
  }

  // ✅ PDF com JWT
  downloadMyCertificatePdf(courseId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/students/me/certificates/${courseId}/pdf`, {
      headers: this.authHeaders(),
      responseType: 'blob',
    });
  }
}
