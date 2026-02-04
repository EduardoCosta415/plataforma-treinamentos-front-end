import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CourseMin = {
  id: string;
  title: string;
};

export type LibraryItem = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileKey?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt?: string;
};

export type LibraryByCourseResponse = {
  courseId: string;
  courseTitle: string;
  items: LibraryItem[];
};

@Injectable({ providedIn: 'root' })
export class AdminLibraryService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private authHeadersNoCache() {
    const token = localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      }),
    };
  }

  private ts() {
    return `ts=${Date.now()}`;
  }

  listCoursesMin(): Observable<CourseMin[]> {
    return this.http.get<CourseMin[]>(
      `${this.baseUrl}/courses/min?${this.ts()}`,
      this.authHeadersNoCache(),
    );
  }

  listByCourse(courseId: string): Observable<LibraryByCourseResponse> {
    return this.http.get<LibraryByCourseResponse>(
      `${this.baseUrl}/admin/library/course/${courseId}?${this.ts()}`,
      this.authHeadersNoCache(),
    );
  }

  uploadPdf(payload: {
    courseId: string;
    title?: string;
    description?: string;
    file: File;
  }): Observable<any> {
    const form = new FormData();
    form.append('courseId', payload.courseId);

    if (payload.title) form.append('title', payload.title);
    if (payload.description) form.append('description', payload.description);

    form.append('file', payload.file);

    // upload não precisa de cache buster
    return this.http.post(
      `${this.baseUrl}/admin/library`,
      form,
      this.authHeadersNoCache(),
    );
  }

  removeItem(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/admin/library/${id}?${this.ts()}`,
      this.authHeadersNoCache(),
    );
  }

  // ✅ abre PDFs salvos como "/uploads/..."
  buildFileUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
  }
}
