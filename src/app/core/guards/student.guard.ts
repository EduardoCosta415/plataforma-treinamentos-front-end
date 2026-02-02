import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class StudentGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const raw = localStorage.getItem('user');
    if (!raw) return this.router.parseUrl('/login');

    try {
      const user = JSON.parse(raw);
      const role = String(user?.role || '').toUpperCase();

      if (role === 'STUDENT') return true;

      // se for admin, manda pro admin
      if (role === 'ADMIN') return this.router.parseUrl('/admin');

      return this.router.parseUrl('/login');
    } catch {
      return this.router.parseUrl('/login');
    }
  }
}
