import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminExamsApiService } from '../exams/services/admin-exams-api.service';
import { ExamQuestionAdmin } from '../exams/models/exam-admin.model';

@Component({
  selector: 'app-exam-editor',
  templateUrl: './exam-editor.component.html',
  styleUrls: ['./exam-editor.component.scss'],
})


export class ExamEditorComponent implements OnInit {
  loading = false;
  saving = false;
  error = '';

  examId: string | null = null;
  questions: ExamQuestionAdmin[] = [];
  courses: { id: string; title: string }[] = [];

  form = this.fb.group({
    courseId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    passScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    isActive: [true],
  });

  questionForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    order: [1, [Validators.required, Validators.min(1)]],
    options: this.fb.array([
      this.fb.group({ label: ['Opção A', Validators.required], isCorrect: [true] }),
      this.fb.group({ label: ['Opção B', Validators.required], isCorrect: [false] }),
    ]),
  });

  constructor(
    private fb: FormBuilder,
    private api: AdminExamsApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id');
    this.loadCourses();

    if (this.examId && this.examId !== 'new') {
      this.loadExam(this.examId);
    }
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
  return ctrl as FormGroup;
}

asFormControl(ctrl: AbstractControl | null): FormControl {
  return ctrl as FormControl;
}

  private loadCourses(): void {
    this.api.listCourses().subscribe({
      next: (rows) => (this.courses = rows || []),
      error: () => {
        // se não existir endpoint, você ainda consegue criar usando courseId manualmente
        this.courses = [];
      },
    });
  }

  private loadExam(id: string): void {
    this.loading = true;
    this.api.get(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          courseId: data.courseId,
          title: data.title,
          passScore: data.passScore,
          isActive: data.isActive,
        });
        this.questions = data.questions || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar prova';
        this.loading = false;
      },
    });
  }

  saveExam(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = this.form.getRawValue();

    // CREATE
    if (!this.examId || this.examId === 'new') {
      this.api.create(payload as any).subscribe({
        next: (created) => {
          this.saving = false;
          this.router.navigate(['admin', 'exams', created.id]);
        },
        error: (err) => {
          console.error(err);
          this.error = err?.error?.message || 'Erro ao criar prova';
          this.saving = false;
        },
      });
      return;
    }

    // UPDATE
    this.api.update(this.examId, payload as any).subscribe({
      next: () => {
        this.saving = false;
        alert('Prova salva ✅');
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'Erro ao salvar prova';
        this.saving = false;
      },
    });
  }

  addOption(): void {
    this.options.push(this.fb.group({ label: ['', Validators.required], isCorrect: [false] }));
  }

  removeOption(i: number): void {
    if (this.options.length <= 2) return;
    this.options.removeAt(i);
  }

  // garante 1 correta
  markCorrect(index: number): void {
    this.options.controls.forEach((c, i) => c.get('isCorrect')?.setValue(i === index));
  }

  addQuestion(): void {
    if (!this.examId || this.examId === 'new') {
      alert('Salve a prova primeiro para adicionar perguntas.');
      return;
    }

    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const raw = this.questionForm.getRawValue();
    const options = (raw.options || []).map((o: any) => ({
      label: (o.label || '').trim(),
      isCorrect: !!o.isCorrect,
    }));

    // validações básicas
    if (options.length < 2) return alert('Mínimo 2 opções');
    const correctCount = options.filter((x) => x.isCorrect).length;
    if (correctCount !== 1) return alert('Precisa ter exatamente 1 opção correta');

    this.api.addQuestion(this.examId, {
      title: (raw.title || '').trim(),
      order: Number(raw.order || 1),
      options,
    }).subscribe({
      next: () => {
        // recarrega
        this.loadExam(this.examId!);
        // reset form pergunta
        this.questionForm.reset({ title: '', order: 1 });
        this.options.clear();
        this.options.push(this.fb.group({ label: ['Opção A', Validators.required], isCorrect: [true] }));
        this.options.push(this.fb.group({ label: ['Opção B', Validators.required], isCorrect: [false] }));
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Erro ao adicionar pergunta');
      },
    });
  }

  removeQuestion(q: ExamQuestionAdmin): void {
    const ok = confirm(`Excluir a pergunta "${q.title}"?`);
    if (!ok) return;

    this.api.removeQuestion(q.id).subscribe({
      next: () => {
        if (this.examId && this.examId !== 'new') this.loadExam(this.examId);
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Erro ao excluir pergunta');
      },
    });
  }

  back(): void {
    this.router.navigate(['admin', 'exams']);
  }
}
