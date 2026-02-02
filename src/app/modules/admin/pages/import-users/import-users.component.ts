import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-import-users',
  templateUrl: './import-users.component.html',
})
export class ImportUsersComponent {
  file: File | null = null;
  loading = false;
  result: any = null;
  error = '';

  private readonly apiUrl = 'http://localhost:3000/import/users';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  onFileSelected(event: any) {
    this.file = event.target.files[0] || null;
  }

  import() {
    if (!this.file) {
      this.error = 'Selecione um arquivo CSV';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;

    const formData = new FormData();
    formData.append('file', this.file);

    this.http
      .post(this.apiUrl, formData, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.auth.token}`,
        }),
      })
      .subscribe({
        next: (res) => {
          this.result = res;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erro ao importar arquivo';
          this.loading = false;
        },
      });
  }
}
