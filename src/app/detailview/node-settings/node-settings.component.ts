import { Component, Input } from '@angular/core';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-node-settings',
  templateUrl: './node-settings.component.html',
  styleUrls: ['./node-settings.component.less']
})
export class NodeSettingsComponent {

  @Input() topicChunks: string[] | null = null;

  settings: INavSettings | null = null;

  topicTypes = ['Automatic', 'Information', 'Switch', 'Parameter'];
  topicType = 'Automatic';
  
  valueTypes = ['Automatic', 'Integer', 'Number', 'Enumeration', 'String'];
  valueType = 'Automatic';

  topicRanks = ['Automatic', 1, 2, 3, 4, 5]
  topicRank = 'Automatic';

  topicPicture = 'Automatic';

  constructor(private settingService: SettingsService) {
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
    this.topicType = settings.getTopicType();
    this.valueType = settings.getValueType();
    this.topicRank = String(settings.getTopicRank());
  }

  /**
   * Sets the topic type to the setting store
   */
  onSelectTopic() {
    this.settings?.setTopicType(this.topicType);
    this.settingService.writeToLocalStore();
  }

  /**
   * Sets the rank to the setting store
   */
  onSelectRank() {
    this.settings?.setTopicRank(this.topicRank);
    this.settingService.writeToLocalStore();
  }

}
