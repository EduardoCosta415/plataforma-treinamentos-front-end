import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ExamAdmin,
  ExamQuestionAdmin,
  CreateExamPayload,
  UpdateExamPayload,
  CreateQuestionPayload,
} from '../models/exam-admin.model';

@Injectable({ providedIn: 'root' })
export class AdminExamsApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // ✅ LISTA provas
  list(): Observable<ExamAdmin[]> {
    return this.http.get<ExamAdmin[]>(
      `${this.baseUrl}/admin/exams`,
      this.authHeaders(),
    );
  }

  // ✅ DETALHE prova (com questions/options)
  get(examId: string): Observable<ExamAdmin & { questions: ExamQuestionAdmin[] }> {
    return this.http.get<ExamAdmin & { questions: ExamQuestionAdmin[] }>(
      `${this.baseUrl}/admin/exams/${examId}`,
      this.authHeaders(),
    );
  }

  // ✅ CRIAR prova
  create(payload: CreateExamPayload): Observable<ExamAdmin> {
    return this.http.post<ExamAdmin>(
      `${this.baseUrl}/admin/exams`,
      payload,
      this.authHeaders(),
    );
  }

  // ✅ EDITAR prova
  update(examId: string, payload: UpdateExamPayload): Observable<ExamAdmin> {
    return this.http.patch<ExamAdmin>(
      `${this.baseUrl}/admin/exams/${examId}`,
      payload,
      this.authHeaders(),
    );
  }

  // ✅ EXCLUIR prova
  remove(examId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/admin/exams/${examId}`,
      this.authHeaders(),
    );
  }

  // ✅ CRIAR pergunta
  addQuestion(examId: string, payload: CreateQuestionPayload): Observable<ExamQuestionAdmin> {
    return this.http.post<ExamQuestionAdmin>(
      `${this.baseUrl}/admin/exams/${examId}/questions`,
      payload,
      this.authHeaders(),
    );
  }

  // ✅ EDITAR pergunta
  updateQuestion(questionId: string, payload: CreateQuestionPayload): Observable<ExamQuestionAdmin> {
    return this.http.patch<ExamQuestionAdmin>(
      `${this.baseUrl}/admin/exams/questions/${questionId}`,
      payload,
      this.authHeaders(),
    );
  }

  // ✅ EXCLUIR pergunta
  removeQuestion(questionId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/admin/exams/questions/${questionId}`,
      this.authHeaders(),
    );
  }

  // (opcional) listar cursos pra combo
listCourses() {
  return this.http.get<{ id: string; title: string }[]>(
    `${this.baseUrl}/courses/min`,
    this.authHeaders(),
  );
}
}

