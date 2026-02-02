import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

type LoginMode = 'ADMIN' | 'STUDENT';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  mode: LoginMode = 'ADMIN';

  email = 'admin@admin.com';
  password = 'admin123';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  setMode(mode: LoginMode) {
    this.mode = mode;
    this.error = '';

    // ✅ facilita teste rápido (pode apagar depois)
    if (mode === 'ADMIN') {
      this.email = 'admin@admin.com';
      this.password = 'admin123';
    } else {
      this.email = '';
      this.password = '';
    }
  }

  submit() {
    this.error = '';
    this.loading = true;

    const req =
      this.mode === 'ADMIN'
        ? this.auth.login(this.email, this.password)
        : this.auth.loginStudent(this.email, this.password);

    req.subscribe({
      next: () => {
        this.loading = false;

        const user = this.auth.user;
        const mustChange = this.auth.mustChangePassword;

        // ✅ redirecionamento por role
        if (user?.role === 'STUDENT') {
          // ✅ no próximo passo a gente cria a tela de troca de senha
          if (mustChange) {
            // por enquanto, manda pra área do aluno mesmo (não quebra o fluxo)
            this.router.navigateByUrl('/aluno');
            return;
          }
          this.router.navigateByUrl('/aluno');
          return;
        }

        // default admin
        this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Erro ao fazer login';
      },
    });
  }
}
