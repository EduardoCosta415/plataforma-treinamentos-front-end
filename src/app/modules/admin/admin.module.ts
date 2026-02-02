import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardPageComponent } from './pages/dashboard/pages/dashboard-page/dashboard-page.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { StudentsComponent } from './pages/students/students.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { RouterModule } from '@angular/router';

import { CourseContentComponent } from './pages/course-content/course-content.component';
import { ImportUsersComponent } from './pages/import-users/import-users.component';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { ExamEditorComponent } from './pages/exam-editor/exam-editor.component';


@NgModule({
  declarations: [
    AdminLayoutComponent,
    CompaniesComponent,
    StudentsComponent,
    CoursesComponent,
    CourseContentComponent,
    ImportUsersComponent,
    ExamEditorComponent

  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    RouterModule,
    DashboardModule,
    ReactiveFormsModule,
  ]
})
export class AdminModule { }
