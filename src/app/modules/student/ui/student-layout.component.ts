import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { StudentCoursesService } from '../service/student-courses.service';
import { StudentCertificatesService } from '../service/studente-service.certificate';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss'],
})
export class StudentLayoutComponent implements OnInit {
  userEmail = '';
  userRole = '';

  // Sidebar counters
  hasAnyExam = false;
  totalExams = 0;

  totalCertificates = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
    private coursesApi: StudentCoursesService,
    private certApi: StudentCertificatesService,
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadSidebarCounters();
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;

      const user = JSON.parse(raw);
      this.userEmail = user?.email || '';
      this.userRole = user?.role || '';
    } catch {
      this.userEmail = '';
      this.userRole = '';
    }
  }

  private loadSidebarCounters(): void {
    // Provas (baseado nos cursos que têm exam)
    this.coursesApi.listMyCourses().subscribe({
      next: (courses: any[]) => {
        const list = courses || [];
        const withExam = list.filter((c) => !!c?.hasExam);
        this.totalExams = withExam.length;
        this.hasAnyExam = this.totalExams > 0;
      },
      error: () => {
        this.totalExams = 0;
        this.hasAnyExam = false;
      },
    });

    // Certificados (quantos já liberados)
    this.certApi.listMyCertificates().subscribe({
      next: (certs) => {
        this.totalCertificates = (certs as any || []).length;
      },
      error: () => {
        this.totalCertificates = 0;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
