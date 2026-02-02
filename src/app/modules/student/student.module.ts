import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { StudentRoutingModule } from './student-routing.module';

import { StudentLayoutComponent } from './ui/student-layout.component';
import { MyCoursesComponent } from './pages/my-courses/my-courses.component';


import { CertificateComponent } from './pages/certificate/certificate.component';
import { StudentExamPlayerComponent } from './pages/exams/exam-player/student-exam-player.component';
import { StudentExamsComponent } from './pages/exams/student-exams/student-exams.component';

@NgModule({
  declarations: [
    StudentLayoutComponent,
    MyCoursesComponent,
    StudentExamsComponent,
    StudentExamPlayerComponent,
    CertificateComponent,
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
