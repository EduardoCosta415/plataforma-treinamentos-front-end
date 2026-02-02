import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  // ✅ Landing como entrada
  { path: '', redirectTo: 'site', pathMatch: 'full' },

  // ✅ Landing
  {
    path: 'site',
    loadChildren: () =>
      import('./modules/site/site.module').then((m) => m.SiteModule),
  },

  // Login (público)
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },

  // Admin (protegido)
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },

  // ✅ Aluno (protegido) — tudo dentro do lazy module
  {
    path: 'aluno',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/student/student.module').then((m) => m.StudentModule),
  },

  // ✅ Fallback para landing
  { path: '**', redirectTo: 'site' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
