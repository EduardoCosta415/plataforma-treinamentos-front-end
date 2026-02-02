import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type StudentCertificate = {
  id: string;
  courseId: string;
  courseTitle: string;
  scorePercent: number;
  issuedAt: string; // ISO
};

@Injectable({ providedIn: 'root' })
export class StudentCertificatesService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  listMyCertificates(): Observable<StudentCertificate[]> {
    return this.http.get<StudentCertificate[]>(
      `${this.baseUrl}/students/me/certificates`,
      this.authHeaders(),
    );
  }
}
