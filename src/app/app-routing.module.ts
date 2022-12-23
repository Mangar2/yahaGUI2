import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewScreenComponent } from './overview/overview-screen/overview-screen.component';

const routes: Routes = [
  {
    path: 'yahagui',
    component: OverviewScreenComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
