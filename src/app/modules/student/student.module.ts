import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { StudentRoutingModule } from './student-routing.module';
import { StudentLayoutComponent } from './ui/student-layout.component';
import { MyCoursesComponent } from './pages/my-courses/my-courses.component';
import { StudentExamsComponent } from './pages/exams/student-exams/student-exams.component';
import { StudentExamPlayerComponent } from './pages/exams/exam-player/student-exam-player.component';
import { StudentCertificatesComponent } from 'src/app/core/certificates/student-certificates.component';
import { CoursePlayerComponent } from './pages/course-player/course-player.component';
import { YoutubePlayerComponent } from 'src/app/shared/youtube/youtube-player.component';

// import { StudentCoursePlayerComponent } from ...

@NgModule({
  declarations: [
    StudentLayoutComponent,
    MyCoursesComponent,
    StudentExamsComponent,
    StudentExamPlayerComponent,
    StudentCertificatesComponent, // ✅ Adicionado (resolve o erro da tela de certificados)
    CoursePlayerComponent, // ✅ Adicione este se tiver o player
    YoutubePlayerComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StudentRoutingModule,
  ],
})
export class StudentModule {}
