import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { StudentsComponent } from './pages/students/students.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseContentComponent } from './pages/course-content/course-content.component';
import { ImportUsersComponent } from './pages/import-users/import-users.component';


import { AdminGuard } from '../../core/guards/admin.guard'; // ✅ ADD AQUI

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard], // ✅ ADD AQUI
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },

 {
  path: 'exams',
  loadChildren: () =>
    import('src/app/modules/admin/pages/exams/exams-routing-module').then((m) => m.ExamsRoutingModule),
},


      { path: 'companies', component: CompaniesComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'cursos/:id/conteudo', component: CourseContentComponent },
      { path: 'importar-alunos', component: ImportUsersComponent },

      // ⚠️ você tem rotas duplicadas de alunos:
      { path: 'alunos', component: StudentsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
