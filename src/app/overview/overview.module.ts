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

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 

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
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  exports: [
    OverviewScreenComponent
  ]
})
export class OverviewModule { }
