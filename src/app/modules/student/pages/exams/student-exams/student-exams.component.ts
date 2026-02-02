import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

type MyCourseDto = {
  id: string;
  title: string;
  progressPercent?: number;
  hasExam?: boolean;
  examId?: string | null;
  examTitle?: string | null;
  examUnlocked?: boolean;
};

type StudentExamItem = {
  courseId: string;
  courseTitle: string;
  examId: string;
  examTitle: string;
  unlocked: boolean;
  progressPercent: number;
};

@Component({
  selector: 'app-student-exams',
  templateUrl: './student-exams.component.html',
})
export class StudentExamsComponent implements OnInit {
  loading = false;
  error = '';
  exams: StudentExamItem[] = [];

  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  private authHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  private load(): void {
    this.loading = true;
    this.error = '';

    this.http
      .get<MyCourseDto[]>(`${this.baseUrl}/students/me/courses`, this.authHeaders())
      .subscribe({
        next: (rows) => {
          const list = rows || [];

          this.exams = list
            .filter((c) => !!c.hasExam && !!c.examId)
            .map((c) => ({
              courseId: c.id,
              courseTitle: c.title,
              examId: c.examId as string,
              examTitle: c.examTitle || 'Prova do curso',
              unlocked: !!c.examUnlocked,
              progressPercent: Number(c.progressPercent || 0),
            }));

          this.loading = false;
        },
        error: () => {
          this.error = 'Erro ao carregar provas';
          this.loading = false;
        },
      });
  }

  openExam(item: StudentExamItem): void {
    if (!item.unlocked) return;

    // Próxima tela (a gente cria depois): /aluno/exams/:examId
    this.router.navigate(['/aluno', 'exams', item.examId]);
  }
}
