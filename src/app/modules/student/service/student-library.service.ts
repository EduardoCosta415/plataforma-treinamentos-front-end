import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type LibraryItem = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  createdAt?: string;
};

export type LibraryCourseGroup = {
  courseId: string;
  courseTitle: string;
  items: LibraryItem[];
};

@Injectable({ providedIn: 'root' })
export class StudentLibraryService {
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

  listMyLibrary(): Observable<LibraryCourseGroup[]> {
    return this.http.get<LibraryCourseGroup[]>(
      `${this.baseUrl}/students/me/library`,
      this.authHeaders(),
    );
  }
}
