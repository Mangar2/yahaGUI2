import { Component } from '@angular/core';
import { config } from 'rxjs';

@Component({
  selector: 'app-settings-selection',
  templateUrl: './settings-selection.component.html',
  styleUrls: ['./settings-selection.component.less']
})
export class SettingsSelectionComponent {
  configType: string = "";
  configTypes: string[] = ["General", "Phone", "Tablet", "Computer"];

  onSave(configType: string) {
    console.log("Save %s", configType);
  }

  onLoad(configType: string) {
    console.log("Load %s", configType);
  }
}
