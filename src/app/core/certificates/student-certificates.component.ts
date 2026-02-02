import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CertificatesService,
  MyCertificateItem,
} from '../../core/certificates/certificates.service';

@Component({
  selector: 'app-student-certificates',
  templateUrl: './student-certificates.component.html',
  styleUrls: ['./student-certificates.component.scss'],
})
export class StudentCertificatesComponent implements OnInit {
  certificates: MyCertificateItem[] = [];

  isLoadingList = true; // Começa true para mostrar o Skeleton
  errorMessage = '';
  downloadingCourseId: string | null = null;

  constructor(private certService: CertificatesService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoadingList = true;
    this.errorMessage = '';

    this.certService.listMyCertificates().subscribe({
      next: (response) => {
        // Simulando um delay minúsculo só para o skeleton não piscar muito rápido se a net for ultra veloz
        setTimeout(() => {
          this.certificates = response || [];
          this.isLoadingList = false;
        }, 400);
      },
      error: (error) => {
        console.error('Erro:', error);
        this.errorMessage = 'Não foi possível carregar seus certificados.';
        this.isLoadingList = false;
      },
    });
  }

  onDownload(cert: MyCertificateItem): void {
    if (this.downloadingCourseId) return;

    this.downloadingCourseId = cert.courseId;

    this.certService.downloadCertificate(cert.courseId).subscribe({
      next: (blob) => {
        this.downloadFile(blob, cert.courseTitle);
        this.downloadingCourseId = null;
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.downloadingCourseId = null;
      },
    });
  }

  private downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Slugify simples para o nome do arquivo
    const safeName = fileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `certificado-${safeName}.pdf`;

    link.click();

    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  private handleError(err: HttpErrorResponse): void {
    // Lógica de tratamento de erro (toast ou alert)
    alert('Erro ao baixar certificado. Tente novamente.');
  }
}
