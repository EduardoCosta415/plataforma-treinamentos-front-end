import { Component, OnInit } from '@angular/core';
import {
  AdminLibraryService,
  CourseMin,
  LibraryItem,
  LibraryByCourseResponse,
} from '../../services/admin-library.service';

@Component({
  selector: 'app-admin-library',
  templateUrl: './admin-library.component.html',
  styleUrls: ['./admin-library.component.scss'],
})
export class AdminLibraryComponent implements OnInit {
  loadingCourses = false;
  loadingItems = false;
  uploading = false;

  error = '';
  success = '';

  courses: CourseMin[] = [];
  selectedCourseId = '';

  items: LibraryItem[] = [];
  courseTitle = '';

  // form
  title = '';
  description = '';
  file: File | null = null;

  constructor(private api: AdminLibraryService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.error = '';
    this.success = '';

    this.api.listCoursesMin().subscribe({
      next: (data) => {
        this.courses = data || [];
        this.loadingCourses = false;

        if (!this.selectedCourseId && this.courses.length > 0) {
          this.selectedCourseId = this.courses[0].id;
          this.loadItems();
        }
      },
      error: (err) => {
        console.log('LOAD COURSES MIN ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao carregar cursos';
        this.loadingCourses = false;
      },
    });
  }

  onCourseChange(courseId: string): void {
    this.selectedCourseId = courseId;
    this.loadItems();
  }

  loadItems(): void {
    if (!this.selectedCourseId) return;

    this.loadingItems = true;
    this.error = '';
    this.success = '';

    this.api.listByCourse(this.selectedCourseId).subscribe({
      next: (res: LibraryByCourseResponse) => {
        this.courseTitle = res?.courseTitle || '';
        this.items = res?.items || [];
        this.loadingItems = false;
      },
      error: (err) => {
        console.log('LOAD LIBRARY BY COURSE ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao carregar biblioteca do curso';
        this.loadingItems = false;
      },
    });
  }

  onTitleInput(value: string) {
    this.title = value;
  }

  onDescriptionInput(value: string) {
    this.description = value;
  }

  onFilePicked(ev: any): void {
    const f: File | null = ev?.target?.files?.[0] || null;

    this.file = null;

    if (!f) return;

    const isPdf =
      f.type === 'application/pdf' ||
      (f.name || '').toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.error = 'Apenas PDF é permitido';
      return;
    }

    this.file = f;
  }

  upload(): void {
    this.error = '';
    this.success = '';

    if (!this.selectedCourseId) {
      this.error = 'Selecione um curso';
      return;
    }

    if (!this.file) {
      this.error = 'Selecione um PDF';
      return;
    }

    const title = (this.title || '').trim();
    const description = (this.description || '').trim();

    this.uploading = true;

    this.api
      .uploadPdf({
        courseId: this.selectedCourseId,
        title: title || undefined,
        description: description || undefined,
        file: this.file,
      })
      .subscribe({
        next: () => {
          this.uploading = false;
          this.success = 'PDF enviado com sucesso!';

          // reset form
          this.title = '';
          this.description = '';
          this.file = null;

          // reset input file
          const input = document.getElementById('pdfFile') as HTMLInputElement | null;
          if (input) input.value = '';

          this.loadItems();
        },
        error: (err) => {
          console.log('UPLOAD PDF ERROR =>', err);
          this.error = err?.error?.message || 'Erro ao enviar PDF';
          this.uploading = false;
        },
      });
  }

  openPdf(item: LibraryItem): void {
    const url = this.api.buildFileUrl(item.fileUrl);
    window.open(url, '_blank');
  }

  remove(item: LibraryItem): void {
    if (!item?.id) return;
    if (!confirm('Remover este PDF da biblioteca?')) return;

    this.error = '';
    this.success = '';

    this.api.removeItem(item.id).subscribe({
      next: () => {
        this.success = 'Removido!';
        this.loadItems();
      },
      error: (err) => {
        console.log('REMOVE ITEM ERROR =>', err);
        this.error = err?.error?.message || 'Erro ao remover';
      },
    });
  }

  formatBytes(bytes?: number | null): string {
    const b = Number(bytes || 0);
    if (!b) return '';
    const kb = b / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
