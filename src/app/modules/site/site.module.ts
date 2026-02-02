import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteRoutingModule } from './site-routing.module';
import { LandingComponent } from './pages/landing/landing.component';

@NgModule({
  declarations: [LandingComponent],
  imports: [CommonModule, SiteRoutingModule],
})
export class SiteModule {}
