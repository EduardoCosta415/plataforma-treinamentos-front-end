import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SiteRoutingModule } from './site-routing.module';
import { LandingComponent } from './pages/landing/landing.component';

@NgModule({
  declarations: [LandingComponent],
  imports: [CommonModule, ReactiveFormsModule, SiteRoutingModule],
})
export class SiteModule {}
