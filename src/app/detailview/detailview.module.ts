/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatTableModule } from '@angular/material/table'; 
import { MatPaginatorModule } from '@angular/material/paginator';

import { DetailOverviewComponent } from './detail-overview/detail-overview.component';
import { StatusComponent } from './status/status.component';
import { NodeSettingsComponent } from './node-settings/node-settings.component';
import { HistoryComponent } from './history/history.component';



@NgModule({
  declarations: [
    DetailOverviewComponent,
    StatusComponent,
    NodeSettingsComponent,
    HistoryComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule
  ]
})
export class DetailviewModule { }
