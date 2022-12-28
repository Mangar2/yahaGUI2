import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChangeService } from 'src/app/api/change.service';
import { IStorageNode } from 'src/app/data/message-tree.service';
import { SettingDecisions } from 'src/app/settings/setting-decisions';
import { INavSettings } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.less']
})
export class StatusComponent {

  @Output() valueChangeEvent = new EventEmitter<string>();
  @Input() isUpdatingTopic: boolean = false;

  topicType: string;
  valueType: string;
  topicName: string = "";
  topicValue: string = "";
  _navSettings: INavSettings | null = null;
  _topicNode: IStorageNode | null = null;

  constructor(private changeService: ChangeService) {
    this.topicType = SettingDecisions.decideType("", "");
    this.valueType = SettingDecisions.decideValueType("", "");
  }


  get navSettings(): INavSettings | null {
    return this._navSettings;
  }

  private capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Probes, if the current node has been changed by a set command and can thus be updated
   * @param topicNode current node for the topic
   * @returns true, if the node has a child with "set"
   */
  isUpdatable(topicNode: IStorageNode | null): boolean {
    let result  = false;
    if (topicNode) {
      for (const childName in topicNode.childs) {
        if (childName === 'set') {
          result = true;
          break;
        }
      }
    }
    return result;
  }
  

  @Input()
  set navSettings(navSettings: INavSettings | null) {
    this._navSettings = navSettings;
    if (this.navSettings !== null) {
      this.topicType = SettingDecisions.decideType(this.navSettings.getTopicType(), this.topicValue);
      this.valueType = SettingDecisions.decideValueType(this.navSettings.getValueType(), this.topicValue);

    }
  }

  get topicNode(): IStorageNode | null {
    return this._topicNode;
  }

  @Input() 
  set topicNode(topicNode: IStorageNode | null) {
    this._topicNode = topicNode;
    if (this.topicNode && this.topicNode.topic) {
      const topicChunks = this.topicNode.topic.split('/');
      const nodeName = topicChunks.at(-1);
      this.topicName = nodeName ? nodeName : 'Unknown, an error occured';
      this.topicName = this.capitalizeFirstLetter(this.topicName);
      if (this.topicNode.value) {
        this.topicValue = this.topicNode.value.toString();
      }
    }
  }

  ngOnChanges() {
    if (this.navSettings && this.topicNode) {
      if (this.navSettings.getTopicType() === 'Automatic' && this.isUpdatable(this.topicNode)) {
        this.topicType = 'Parameter';
      }
    }
  }

  public isSwitchOn(): boolean {
    return SettingDecisions.isSwitchOn(this.topicValue);
  }

  /**
   * Handles the change of a topic value
   */
  onTopicValueChange(): void {

  }

  /**
   * Handles a switch change
   * @param topic of the element
   * @param event change event
   */
  onChange(event: any): void {
    const newValue = event.checked ? 'on' : 'off';
    event.source.checked = !event.checked;
    if (this.isUpdatingTopic) {
      return;
    }
    this.valueChangeEvent.emit(newValue);
  }


}
