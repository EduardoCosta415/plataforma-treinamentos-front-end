import { Component, OnInit } from '@angular/core';
import { StudentLibraryService, LibraryCourseGroup } from '../../service/student-library.service';

@Component({
  selector: 'app-student-library',
  templateUrl: './student-library.component.html',
  styleUrls: ['./student-library.component.scss'],
})
export class StudentLibraryComponent implements OnInit {
  loading = false;
  error = '';
  groups: LibraryCourseGroup[] = [];

  constructor(private api: StudentLibraryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.api.listMyLibrary().subscribe({
      next: (data) => {
        this.groups = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.log('LOAD LIBRARY ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao carregar biblioteca';
        this.loading = false;
      },
    });
  }

  openPdf(url: string): void {
    if (!url) return;
    window.open(url, '_blank');
  }
}
