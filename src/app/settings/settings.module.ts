import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SettingsControllerComponent } from './settings-controller/settings-controller.component';
import { SettingsSelectionComponent } from './settings-selection/settings-selection.component';



@NgModule({
  declarations: [
    SettingsControllerComponent,
    SettingsSelectionComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class SettingsModule { }
