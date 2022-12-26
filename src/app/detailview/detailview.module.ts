import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSelectModule } from '@angular/material/select';

import { DetailOverviewComponent } from './detail-overview/detail-overview.component';
import { StatusComponent } from './status/status.component';
import { NodeSettingsComponent } from './node-settings/node-settings.component';



@NgModule({
  declarations: [
    DetailOverviewComponent,
    StatusComponent,
    NodeSettingsComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule
  ]
})
export class DetailviewModule { }
