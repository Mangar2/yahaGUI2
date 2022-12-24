import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    NavModule
  ],
  exports: [
    OverviewScreenComponent
  ]
})
export class OverviewModule { }
