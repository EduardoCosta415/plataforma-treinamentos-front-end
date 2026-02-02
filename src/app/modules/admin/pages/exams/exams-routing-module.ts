import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamsListComponent } from '../exams-list/exams-list.component';
import { ExamEditorComponent } from '../exam-editor/exam-editor.component';

const routes: Routes = [
  { path: '', component: ExamsListComponent },
  { path: 'new', component: ExamEditorComponent },
  { path: ':id', component: ExamEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamsRoutingModule {}
