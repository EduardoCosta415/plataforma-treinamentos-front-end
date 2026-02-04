import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  StudentExamsApiService,
  StudentExamView,
} from '../../../../admin/pages/exams/student-exams-api.service';

@Component({
  selector: 'app-student-exam-player',
  template: `
    <div class="card" style="padding:16px;">
      <div
        style="display:flex; justify-content:space-between; align-items:center; gap:12px;"
      >
        <div>
          <div style="font-weight:900; font-size:18px;">Fazer Prova</div>
          <div style="font-size:12px; color:var(--muted); margin-top:6px;">
            ExamId: <b>{{ examId }}</b>
          </div>
        </div>

        <div *ngIf="result" class="badge">
          Nota: {{ result.scorePercent }}% •
          {{ result.passed ? 'APROVADO ✅' : 'REPROVADO ❌' }}
        </div>
      </div>

      <div *ngIf="error" class="alert-error" style="margin-top:12px;">
        {{ error }}
      </div>

      <div *ngIf="loading" style="margin-top:12px; color:var(--muted);">
        Carregando prova...
      </div>

      <div *ngIf="!loading && exam" style="margin-top:12px;">
        <div style="font-size:12px; color:var(--muted);">
          {{ exam.title }} • Nota mínima: <b>{{ exam.passScore }}%</b>

          <span *ngIf="attemptInfo" style="margin-left:8px;">
            Tentativa:
            <b>{{ attemptInfo.attemptNumber }}</b> /
            <b>{{ attemptInfo.maxAttempts }}</b>
          </span>
        </div>

        <!-- ✅ NÃO acessa attemptInfo direto: sempre ?. -->
        <div
          *ngIf="attemptInfo?.alreadyPassed"
          style="margin-top:12px; font-size:12px; color:var(--muted);"
        >
          Você já passou nesta prova (melhor nota:
          <b>{{ attemptInfo?.bestScorePercent ?? 0 }}%</b>). Não precisa fazer
          de novo.
        </div>

        <form
          *ngIf="!attemptInfo?.alreadyPassed"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          <div
            *ngFor="let q of exam.questions"
            class="card"
            style="padding:12px; margin-top:12px;"
          >
            <div style="font-weight:900;">{{ q.order }}. {{ q.title }}</div>

            <div
              style="display:flex; flex-direction:column; gap:8px; margin-top:10px;"
            >
              <label
                *ngFor="let op of q.options"
                style="display:flex; gap:10px; align-items:center; cursor:pointer;"
              >
                <input
                  type="radio"
                  [attr.name]="'q_' + q.id"
                  [checked]="form.get(q.id)?.value === op.id"
                  (change)="selectOption(q.id, op.id)"
                />
                <span>{{ op.label }}</span>
              </label>
            </div>

            <div
              *ngIf="form?.get(q.id)?.touched && form?.get(q.id)?.invalid"
              style="margin-top:8px; font-size:12px; color:#c0392b;"
            >
              Selecione uma opção.
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button class="btn btn-primary" type="submit" [disabled]="sending">
              {{ sending ? 'Enviando...' : 'Enviar respostas' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class StudentExamPlayerComponent implements OnInit {
  examId = '';
  loading = false;
  sending = false;
  error = '';

  exam: StudentExamView | null = null;
  form: FormGroup = this.fb.group({});

  attemptId = '';
  attemptInfo: {
    maxAttempts: number;
    attemptNumber: number;
    alreadyPassed?: boolean;
    bestScorePercent?: number;
  } | null = null;

  result: { scorePercent: number; passed: boolean } | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: StudentExamsApiService
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId') || '';
    if (!this.examId) {
      this.error = 'ExamId inválido';
      return;
    }
    this.startAttempt();
  }

  private startAttempt(): void {
    this.loading = true;
    this.error = '';
    this.result = null;

    this.api.start(this.examId).subscribe({
      next: (res) => {
        this.exam = res.exam;
        this.attemptId = res.attemptId;

        this.attemptInfo = {
          maxAttempts: res.maxAttempts,
          attemptNumber: res.attemptNumber,
          alreadyPassed: res.alreadyPassed,
          bestScorePercent: res.bestScorePercent,
        };

        // ✅ monta form dinamicamente (1 control por questão)
        const group: Record<string, any> = {};
        for (const q of this.exam.questions) {
          group[q.id] = [null, Validators.required];
        }
        this.form = this.fb.group(group);

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erro ao carregar prova';
        this.loading = false;
      },
    });
  }

  selectOption(questionId: string, optionId: string): void {
    this.form.get(questionId)?.setValue(optionId);
    this.form.get(questionId)?.markAsTouched();
  }

  submit(): void {
    if (!this.exam || !this.attemptId) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending = true;
    this.error = '';

    const raw = this.form.getRawValue();
    const answers = this.exam.questions.map((q) => ({
      questionId: q.id,
      optionId: raw[q.id],
    }));

    this.api.submit(this.attemptId, { answers }).subscribe({
      next: (res) => {
        this.result = res;
        this.sending = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erro ao enviar respostas';
        this.sending = false;
      },
    });
  }
}
