import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatListModule } from '@angular/material/list'; 
import { MatIconModule } from '@angular/material/icon'


import { SidenavComponent } from './sidenav/sidenav.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NavComponent } from './nav/nav.component';



@NgModule({
  declarations: [
    SidenavComponent,
    HeaderComponent,
    FooterComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
    
  ],
  exports: [
    SidenavComponent,
    HeaderComponent,
    FooterComponent,
    NavComponent
  ]
})
export class NavModule { }
