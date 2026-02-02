import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type StudentExamOption = { id: string; label: string };
export type StudentExamQuestion = {
  id: string;
  title: string;
  order: number;
  options: StudentExamOption[];
};

export type StudentExamView = {
  id: string;
  courseId: string;
  title: string;
  passScore: number;
  isActive: boolean;
  questions: StudentExamQuestion[];
};

export type StartAttemptResponse = {
  attemptId: string;
  exam: StudentExamView;
  maxAttempts: number;
  attemptNumber: number;
  alreadyPassed?: boolean;
  bestScorePercent?: number;
};

export type SubmitAttemptPayload = {
  answers: { questionId: string; optionId: string }[];
};

export type SubmitAttemptResponse = {
  scorePercent: number;
  passed: boolean;
};

@Injectable({ providedIn: 'root' })
export class StudentExamsApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // 1) cria tentativa + já devolve a prova (sem gabarito)
  start(examId: string): Observable<StartAttemptResponse> {
    return this.http.post<StartAttemptResponse>(
      `${this.baseUrl}/exams/${examId}/attempts/start`,
      {},
      this.authHeaders(),
    );
  }

  // 2) envia respostas e recebe nota/resultado
  submit(attemptId: string, payload: SubmitAttemptPayload): Observable<SubmitAttemptResponse> {
    return this.http.post<SubmitAttemptResponse>(
      `${this.baseUrl}/exams/attempts/${attemptId}/submit`,
      payload,
      this.authHeaders(),
    );
  }
}
