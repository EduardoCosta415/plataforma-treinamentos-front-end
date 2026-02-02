import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminExamsApiService } from '../exams/services/admin-exams-api.service';
import { ExamAdmin } from '../exams/models/exam-admin.model';

@Component({
  selector: 'app-exams-list',
  templateUrl: './exams-list.component.html',
})
export class ExamsListComponent implements OnInit {
  loading = false;
  error = '';
  exams: ExamAdmin[] = [];

  constructor(private api: AdminExamsApiService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.api.list().subscribe({
      next: (rows) => {
        this.exams = rows || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar provas';
        this.loading = false;
      },
    });
  }

  goNew(): void {
    this.router.navigate(['admin', 'exams', 'new']);
  }

  goEdit(id: string): void {
    this.router.navigate(['admin', 'exams', id]);
  }

  removeExam(exam: ExamAdmin): void {
    const ok = confirm(`Excluir a prova "${exam.title}"? (Isso apaga perguntas e tentativas)`);
    if (!ok) return;

    this.api.remove(exam.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Erro ao excluir prova');
      },
    });
  }
}
