import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 

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
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ]
})
export class DetailviewModule { }
