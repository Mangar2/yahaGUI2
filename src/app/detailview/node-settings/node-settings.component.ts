/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview Form Component providing settings for the node
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalSettingsService } from 'src/app/settings/global-settings.service';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-node-settings',
  templateUrl: './node-settings.component.html',
  styleUrls: ['./node-settings.component.less']
})
export class NodeSettingsComponent {

  @Input() topicChunks: string[] | null = null;
  @Output() settingChangeEvent = new EventEmitter();

  settings: INavSettings | null = null;

  settingOptions = this.globalSettings.getSettingOptions()

  constructor(
    private settingService: SettingsService,
    private globalSettings: GlobalSettingsService) {
  }

  ngOnChanges() {
    if (this.topicChunks !== null) {
      this.settings = this.settingService.getNavSettings(this.topicChunks);
      if (this.settings) {
        this.update(this.settings);
      }
    }
  }

  /**
   * Updates members on settings change
   */
  update(settings: INavSettings) {
    this.settingOptions.topicType = settings.getTopicType();
    this.settingOptions.valueType = settings.getValueType();
    this.settingOptions.topicRank = String(settings.getTopicRank());
  }

  /**
   * Sets the topic type to the setting store
   */
  onSelectTopic() {
    this.settings?.setTopicType(this.settingOptions.topicType);
    this.settingService.writeToLocalStore();
    this.settingChangeEvent.emit();
  }

  /**
   * Sets the type of the current value
   */
    onSelectValueType() {
      this.settings?.setValueType(this.settingOptions.valueType);
      this.settingService.writeToLocalStore();
      this.settingChangeEvent.emit();
    }

  /**
   * Sets the rank to the setting store
   */
  onSelectRank() {
    this.settings?.setTopicRank(this.settingOptions.topicRank);
    this.settingService.writeToLocalStore();
    this.settingChangeEvent.emit();
  }

}
