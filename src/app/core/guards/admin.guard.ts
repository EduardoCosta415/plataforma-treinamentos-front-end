import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const raw = localStorage.getItem('user');
    if (!raw) return this.router.parseUrl('/login');

    try {
      const user = JSON.parse(raw);
      const role = String(user?.role || '').toUpperCase();

      if (role === 'ADMIN') return true;

      // se for aluno, manda pra area do aluno
      if (role === 'STUDENT') return this.router.parseUrl('/aluno');

      return this.router.parseUrl('/login');
    } catch {
      return this.router.parseUrl('/login');
    }
  }
}
