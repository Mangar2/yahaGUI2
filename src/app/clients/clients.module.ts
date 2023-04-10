import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsControllerComponent } from './clients-controller/clients-controller.component';
import { ClientsDetailComponent } from './clients-detail/clients-detail.component';
import { ClientsNavComponent } from './clients-nav/clients-nav.component';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    ClientsControllerComponent,
    ClientsDetailComponent,
    ClientsNavComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class ClientsModule { }
