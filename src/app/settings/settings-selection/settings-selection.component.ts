import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { config } from 'rxjs';
import { MessagesService } from 'src/app/api/messages.service';
import { navSettings_t, SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings-selection',
  templateUrl: './settings-selection.component.html',
  styleUrls: ['./settings-selection.component.less']
})
export class SettingsSelectionComponent {
  configType: string = "";
  configTypes: string[] = ["General", "Phone", "Tablet", "Computer"];

  constructor(private messagesService: MessagesService,
    private settingsService: SettingsService) {

  }

  onSave(configType: string) {
    console.log("Save %s", configType);
    const settings = this.settingsService.getAllSettings();
    const observable = this.messagesService.storeConfig("yaha/gui/config/" + configType, settings);
    observable.subscribe((res: HttpResponse<string>) => {
      console.log(res);
    })
  }

  onLoad(configType: string) {
    console.log("Load %s", configType);
    const observable = this.messagesService.readConfig("yaha/gui/config/" + configType);
    observable.subscribe((res: HttpResponse<navSettings_t>) => {
      if (res.status === 200 && res.body) {
        this.settingsService.setAllSettings(res.body);
      }
    })
  }
}
