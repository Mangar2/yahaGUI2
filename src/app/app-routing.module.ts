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
import { RouterModule, Routes } from '@angular/router';
import { ClientsControllerComponent } from './clients/clients-controller/clients-controller.component';
import { DetailOverviewComponent } from './detailview/detail-overview/detail-overview.component';
import { OverviewScreenComponent } from './overview/overview-screen/overview-screen.component';
import { RulesControllerComponent } from './rules/rules-controller/rules-controller.component';
import { SettingsControllerComponent } from './settings/settings-controller/settings-controller.component';

const routes: Routes = [
  {
    path: 'yahagui/overview',
    component: OverviewScreenComponent
  },
  {
    path: 'yahagui/detailview',
    component: DetailOverviewComponent
  },
  {
    path: 'yahagui/settings',
    component: SettingsControllerComponent
  },
  {
    path: 'yahagui/rules',
    component: RulesControllerComponent
  },
  {
    path: 'yahagui/clients',
    component: ClientsControllerComponent
  },
  {
    path: '',
    redirectTo: 'yahagui/overview',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'yahagui/overview',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    { enableTracing: false }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
