import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { StudentCoursesService, Course } from '../../service/student-courses.service';
import { StudentCertificatesService, StudentCertificate } from '../../service/studente-service.certificate';

@Component({
  selector: 'app-certificate',
  template: `
    <div class="card" style="padding:16px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:900; font-size:18px;">Certificados</div>
          <div style="font-size:12px; color:var(--muted); margin-top:6px;">
            Cada curso libera o certificado após você finalizar a prova com nota mínima.
          </div>
        </div>

        <div class="badge" style="white-space:nowrap;">
          Liberados: <b>{{ totalUnlocked }}</b> / {{ totalCourses }}
        </div>
      </div>

      <div *ngIf="error" class="alert-error" style="margin-top:12px;">
        {{ error }}
      </div>

      <div *ngIf="loading" style="margin-top:12px; color:var(--muted);">
        Carregando certificados...
      </div>

      <div *ngIf="!loading" style="margin-top:14px; display:flex; flex-direction:column; gap:12px;">
        <div *ngFor="let c of courses" class="card" style="padding:14px;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
            <div style="min-width:0;">
              <div style="font-weight:900;">{{ c.title }}</div>

              <div style="margin-top:6px; font-size:12px; color:var(--muted);">
                Progresso do curso: <b>{{ c.progressPercent ?? 0 }}%</b>
                • Aulas: {{ c.completedLessons ?? 0 }}/{{ c.totalLessons ?? 0 }}
              </div>

              <div style="margin-top:6px; font-size:12px; color:var(--muted);">
                Prova:
                <b>{{ c.hasExam ? 'Sim' : 'Não' }}</b>
                <span *ngIf="c.hasExam && !c.examUnlocked">
                  • Termine as aulas para liberar a prova
                </span>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
              <div
                class="badge"
                [style.opacity]="isUnlocked(c.id) ? '1' : '0.7'"
                style="white-space:nowrap;"
              >
                {{ isUnlocked(c.id) ? 'Liberado ✅' : 'Bloqueado 🔒' }}
              </div>

              <button
                class="btn btn-primary"
                [disabled]="!isUnlocked(c.id)"
                (click)="openCertificate(c.id)"
              >
                {{ isUnlocked(c.id) ? 'Ver certificado' : 'Termine a prova' }}
              </button>
            </div>
          </div>

          <div *ngIf="isUnlocked(c.id)" style="margin-top:10px; font-size:12px; color:var(--muted);">
            Emitido em: <b>{{ getIssuedAt(c.id) }}</b> • Nota: <b>{{ getScore(c.id) }}%</b>
          </div>
        </div>

        <div *ngIf="!courses.length" style="color:var(--muted); font-size:12px;">
          Você ainda não possui cursos matriculados.
        </div>
      </div>
    </div>
  `,
})
export class CertificateComponent implements OnInit {
  loading = false;
  error = '';

  courses: Course[] = [];
  certificates: StudentCertificate[] = [];

  private certByCourse = new Map<string, StudentCertificate>();

  totalCourses = 0;
  totalUnlocked = 0;

  constructor(
    private coursesApi: StudentCoursesService,
    private certApi: StudentCertificatesService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      courses: this.coursesApi.listMyCourses(),
      certs: this.certApi.listMyCertificates(),
    }).subscribe({
      next: ({ courses, certs }) => {
        this.courses = courses || [];
        this.certificates = certs || [];

        this.certByCourse.clear();
        for (const cert of this.certificates) {
          this.certByCourse.set(cert.courseId, cert);
        }

        this.totalCourses = this.courses.length;
        this.totalUnlocked = this.courses.filter((c) => this.certByCourse.has(c.id)).length;

        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = err?.error?.message || 'Erro ao carregar certificados';
        this.loading = false;
      },
    });
  }

  isUnlocked(courseId: string): boolean {
    return this.certByCourse.has(courseId);
  }

  getIssuedAt(courseId: string): string {
    const cert = this.certByCourse.get(courseId);
    if (!cert?.issuedAt) return '-';
    try {
      return new Date(cert.issuedAt).toLocaleString();
    } catch {
      return cert.issuedAt;
    }
  }

  getScore(courseId: string): number {
    const cert = this.certByCourse.get(courseId);
    return cert?.scorePercent ?? 0;
  }

  openCertificate(courseId: string): void {
    const cert = this.certByCourse.get(courseId);
    if (!cert) return;

    alert(
      `Certificado liberado!\nCurso: ${cert.courseTitle}\nNota: ${cert.scorePercent}%\nEmitido em: ${cert.issuedAt}`,
    );
  }
}
