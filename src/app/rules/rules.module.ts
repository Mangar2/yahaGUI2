import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RulesControllerComponent } from './rules-controller/rules-controller.component';
import { RulesTableComponent } from './rules-table/rules-table.component';
import { RuleFormComponent } from './rule-form/rule-form.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list'; 
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RuleNavComponent } from './rule-nav/rule-nav.component';



@NgModule({
  declarations: [
    RulesControllerComponent,
    RulesTableComponent,
    RuleFormComponent,
    RuleNavComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatCheckboxModule
  ]
})
export class RulesModule { }
