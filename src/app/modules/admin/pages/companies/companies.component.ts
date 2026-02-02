import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';

type Company = {
  id: string;
  name: string;
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
};

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
})
export class CompaniesComponent implements OnInit {
  items: Company[] = [];
  loading = false;
  error = '';

  name = '';
  cnpj = '';
  email = '';
  phone = '';

  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.load();
  }

  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.token}`,
      }),
    };
  }

  load() {
    this.loading = true;
    this.error = '';

    this.http.get<Company[]>(`${this.baseUrl}/companies`, this.authHeaders()).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.log('LOAD COMPANIES ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao carregar empresas';
        this.loading = false;
      },
    });
  }

  create() {
    this.error = '';
    if (!this.name.trim()) {
      this.error = 'Nome é obrigatório';
      return;
    }

    const payload = {
      name: this.name.trim(),
      cnpj: this.cnpj.trim() || undefined,
      email: this.email.trim() || undefined,
      phone: this.phone.trim() || undefined,
    };

    this.http.post(`${this.baseUrl}/companies`, payload, this.authHeaders()).subscribe({
      next: () => {
        this.name = '';
        this.cnpj = '';
        this.email = '';
        this.phone = '';
        this.load();
      },
      error: (err) => {
        console.log('CREATE COMPANY ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao criar empresa';
      },
    });
  }
}
