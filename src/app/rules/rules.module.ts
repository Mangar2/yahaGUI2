import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RulesControllerComponent } from './rules-controller/rules-controller.component';
import { RulesTableComponent } from './rules-table/rules-table.component';
import { RuleFormComponent } from './rule-form/rule-form.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';



@NgModule({
  declarations: [
    RulesControllerComponent,
    RulesTableComponent,
    RuleFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatCheckboxModule
  ]
})
export class RulesModule { }
