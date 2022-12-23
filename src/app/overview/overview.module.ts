import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewScreenComponent } from './overview-screen/overview-screen.component';

@NgModule({
  declarations: [
    OverviewScreenComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OverviewScreenComponent
  ]
})
export class OverviewModule { }
