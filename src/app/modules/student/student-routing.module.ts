import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentLayoutComponent } from './ui/student-layout.component';
import { MyCoursesComponent } from './pages/my-courses/my-courses.component';
import { StudentExamsComponent } from './pages/exams/student-exams/student-exams.component';
import { StudentExamPlayerComponent } from './pages/exams/exam-player/student-exam-player.component';
import { StudentCertificatesComponent } from 'src/app/core/certificates/student-certificates.component';
import { CoursePlayerComponent } from './pages/course-player/course-player.component';
import { StudentLibraryComponent } from './pages/library/student-library.component'

// ⚠️ IMPORTANTE: Importe o componente que exibe as aulas do curso
// Se você ainda não tem esse arquivo, crie ele ou ajuste o import
// import { StudentCoursePlayerComponent } from './pages/course-player/student-course-player.component';

const routes: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      // Lista de Cursos (Home do Aluno)
      { path: '', component: MyCoursesComponent },

      // 👇 ADICIONE ESTA ROTA (É ELA QUE O BOTÃO "CONTINUAR" PROCURA)
      { path: 'curso/:id', component: CoursePlayerComponent },

      // Provas
      { path: 'provas', component: StudentExamsComponent },
      { path: 'provas/:examId', component: StudentExamPlayerComponent },

      // Certificados (Deixei apenas um, você tinha duplicado)
      { path: 'certificados', component: StudentCertificatesComponent },

      //Biblioteca (PDFs por curso)
      {path:'biblioteca', component : StudentLibraryComponent},

      // Fallback: Se a rota não existir, volta para a lista
      { path: '**', redirectTo: '' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRoutingModule {}
