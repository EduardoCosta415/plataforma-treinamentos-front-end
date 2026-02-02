import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentLayoutComponent } from './ui/student-layout.component';
import { MyCoursesComponent } from './pages/my-courses/my-courses.component';
import { CertificateComponent } from './pages/certificate/certificate.component';

// ✅ IMPORTAR DO CAMINHO REAL (estão dentro de pages/exams/...)
import { StudentExamsComponent } from './pages/exams/student-exams/student-exams.component';
import { StudentExamPlayerComponent } from './pages/exams/exam-player/student-exam-player.component';
import { StudentCertificatesComponent } from 'src/app/core/certificates/student-certificates.component';

const routes: Routes = [
  {
    // ✅ IMPORTANTÍSSIMO: aqui é vazio porque o prefixo /aluno já existe no AppRoutingModule
    path: '',
    component: StudentLayoutComponent,
    children: [
      // /aluno
      { path: '', component: MyCoursesComponent },
      { path: 'certificados', component: StudentCertificatesComponent },

      // /aluno/provas
      { path: 'provas', component: StudentExamsComponent },

      // /aluno/provas/:examId
      { path: 'provas/:examId', component: StudentExamPlayerComponent },

      // /aluno/certificados
      { path: 'certificados', component: CertificateComponent },

      // fallback dentro do aluno
      { path: '**', redirectTo: '' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRoutingModule {}
