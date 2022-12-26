import { Component } from '@angular/core';

@Component({
  selector: 'app-node-settings',
  templateUrl: './node-settings.component.html',
  styleUrls: ['./node-settings.component.less']
})
export class NodeSettingsComponent {
  types = ['Undefined', 'Information', 'Switch', 'Parameter'];
  type = 'Undefined';

}
