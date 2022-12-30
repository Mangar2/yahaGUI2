/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview View Component showing the name and current value of the node. It additionally provides
 * the ability to change the current value and inform his controller about this change
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IStorageNode } from 'src/app/data/message-tree.service';
import { DisplaynameService } from 'src/app/settings/displayname.service';
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
  beautifiedTopicName: string = "";
  topicValue: string = "";
  _navSettings: INavSettings | null = null;
  _topicNode: IStorageNode | null = null;

  constructor(private displaynameService: DisplaynameService) {
    this.topicType = SettingDecisions.decideType("", "");
    this.valueType = SettingDecisions.decideValueType("", "");
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

  
  get navSettings(): INavSettings | null {
    return this._navSettings;
  }

  @Input()
  set navSettings(navSettings: INavSettings | null) {
    this._navSettings = navSettings;

  }

  get topicNode(): IStorageNode | null {
    return this._topicNode;
  }

  @Input() 
  set topicNode(topicNode: IStorageNode | null) {
    this._topicNode = topicNode;

  }

  ngOnChanges() {
    if (this.navSettings && this.topicNode && this.topicNode.topic && this.topicNode.value !== undefined) {
      const topicChunks = this.topicNode.topic.split('/');
      const nodeName = topicChunks.at(-1);
      this.topicName = nodeName ? nodeName : 'Unknown, an error occured';
      this.beautifiedTopicName = this.displaynameService.deriveDisplayName(topicChunks);
      this.topicValue = this.topicNode.value.toString();
      this.topicType = SettingDecisions.decideType(this.navSettings.getTopicType(), this.topicValue);
      this.valueType = SettingDecisions.decideValueType(this.navSettings.getValueType(), this.topicValue);
      if (this.navSettings.getTopicType() === 'Automatic' && this.topicType === 'Information' && this.isUpdatable(this.topicNode)) {
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
  onTopicValueChange(newValue: string): void {
    if (this.isUpdatingTopic) {
      return;
    }
    this.valueChangeEvent.emit(newValue);
  }

  /**
   * Checks, if an item is a switch
   * @returns true, if the item is a switch
   */
  isSwitch() {
    return SettingDecisions.isSwitch(this.topicType, this.topicValue);
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
