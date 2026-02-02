import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  userEmail = '';
  userRole = '';

  constructor(private auth: AuthService, private router: Router) {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      this.userEmail = user.email;
      this.userRole = user.role;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
