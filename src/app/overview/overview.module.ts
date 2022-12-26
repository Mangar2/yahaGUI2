import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { OverviewScreenComponent } from './overview-screen/overview-screen.component';
import { NavModule } from 'src/app/nav/nav.module';
import { TopicsComponent } from './topics/topics.component';

@NgModule({
  declarations: [
    OverviewScreenComponent,
    TopicsComponent
  ],
  imports: [
    CommonModule,
    NavModule,
    MatSlideToggleModule
  ],
  exports: [
    OverviewScreenComponent
  ]
})
export class OverviewModule { }
