import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../../core/progress/progress.service';
import { CertificatesService, MyCertificateItem } from '../../core/certificates/certificates.service';
;

type MyCourseMin = { id: string; title: string; examUnlocked?: boolean; hasExam?: boolean; examId?: string | null; };

@Component({
  selector: 'app-student-certificates',
  templateUrl: './student-certificates.component.html',
})
export class StudentCertificatesComponent implements OnInit {
  loading = false;
  error = '';

  courses: MyCourseMin[] = [];
  certs: MyCertificateItem[] = [];

  constructor(
    private certApi: CertificatesService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.certApi.listMyCertificates().subscribe({
      next: (res) => {
        this.certs = res?.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar certificados';
        this.loading = false;
      },
    });
  }

  hasCertificate(courseId: string): MyCertificateItem | null {
    return this.certs.find((c) => c.courseId === courseId) || null;
  }

 openPdf(courseId: string): void {
  this.certApi.downloadMyCertificatePdf(courseId).subscribe({
    next: (blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    error: (err) => {
      console.error(err);
      this.error = 'Não foi possível abrir o PDF (verifique autenticação e se o certificado existe).';
    },
  });
}}
