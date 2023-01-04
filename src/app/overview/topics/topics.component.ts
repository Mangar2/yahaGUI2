/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview View component showing an overview of the relevant topics for the current node
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IMessages } from 'src/app/data/message';
import { SettingsService } from 'src/app/settings/settings.service';
import { Subscription } from 'rxjs'
import { SettingDecisions } from 'src/app/settings/setting-decisions';
import { DisplaynameService } from 'src/app/settings/displayname.service';

export type IValueChangeInfo = {
  topic: string,
  value: string
}

type topicInfo_t = {
  topic: string,
  value: string,
  topicType: string,
  isSwitch: boolean,
  isSwitchOn: boolean
}

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.less']
})
export class TopicsComponent {

  @Input() topicChunks: string[] = [];
  @Input() updatingTopics: { [index:string]: boolean } = {};

  @Output() valueChangeEvent = new EventEmitter<IValueChangeInfo>();

  subscription: Subscription | null = null;
  topicInfos: topicInfo_t[] = []

  constructor(
    private settingsService: SettingsService,
    private displaynameService: DisplaynameService,
    private router: Router) {
  }


  ngOnChanges() {
  }

  sortTopicInfos(topicInfos: topicInfo_t[]): topicInfo_t[] {
    topicInfos.sort((a: topicInfo_t, b: topicInfo_t) => { 
      if (a.topicType < b.topicType) {
        return -1;
      } else if (a.topicType > b.topicType) {
        return  1;
      } else {
        return 0;
      }
    })
    return topicInfos;
  }

  @Input() 
  set messages(messages: IMessages) {
    if (messages !== null) {
      const newTopicInfos: topicInfo_t[] = []
      for (const message of messages) {
        const topic = message.topic;
        const value = message.value ? String(message.value) : "";
        const topicType = this.getTopicType(topic, value);
        const isSwitch = this.isSwitch(topicType, value);
        const isSwitchOn = this.isSwitchOn(value);
        newTopicInfos.push({ topic, value, topicType, isSwitch, isSwitchOn });
      }
      this.topicInfos = this.sortTopicInfos(newTopicInfos);
    }
  }

  /**
   * Opens a detail view for a topic
   * @param topic topic for detail-view
   */
  viewDetails(topic: string): void {
    this.openDetailView(topic);
  }

  /**
   * Opens the detail view for a topic
   * @param topic 
   */
  openDetailView(topic: string): void {
    const navigationExtras: NavigationExtras = {
      queryParams: { topic }
    };
    this.router.navigate(['yahagui', 'detailview'], navigationExtras);
  }

  /**
   * Gets the name (the last element of a topic)
   * @param topic topic to get the name 
   * @returns name of the topic
   */
  getName(topic: string): string {
    return this.displaynameService.deriveDisplayName(topic.split('/'), this.topicChunks);
  }

  /**
   * Checks, if a topic is a switch
   * @param topicType type of the topic
   * @param topicValue value of the topic
   * @returns true, if the topic is a swith
   */
  isSwitch(topicType: string, topicValue: string): boolean {
    return SettingDecisions.isSwitch(topicType, topicValue);
  }

  /**
   * Checks, if a switch is on
   * @param topicValue value of the topic
   * @returns true, if the switch is on
   */
  isSwitchOn(topicValue: string): boolean {
    return SettingDecisions.isSwitchOn(topicValue)
  }

  trimString(str: string | number, maxLen: number = 45): string {
    let result = String(str);
    if (result.length > maxLen) {
      result = result.slice(0, maxLen - 4) + '...';
    }
    return result;
  }

  /**
   * Stops propagation of a click event
   * @param event click event
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Handles a switch change
   * @param topic of the element
   * @param event change event
   */
  onChange(topic: string, event: any): void {
    const newValue = event.checked ? 'on' : 'off';
    event.source.checked = !event.checked;
    this.valueChangeEvent.emit({ topic, value: newValue });
  }

  /**
   * We need to unsubscribe to everything before leaving this view
   */
  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Gets the type of a topic
   * @param topic topic of the element
   * @returns topic type 
   */
  getTopicType(topic: string, topicValue: string): string {
    const topicChunks = topic.split('/');
    const lastChunk = topicChunks.at(-1);
    const navSettings = this.settingsService.getNavSettings(topic.split('/'));
    const topicType = SettingDecisions.decideType(navSettings.getTopicType(), lastChunk, topicValue);
    return topicType;
  }

  /**
   * Gets the unit string of the topic value
   * @param topic topic of the element
   * @returns unit string
   */
  getUnit(topicType: string): string {
    const topicUnit = SettingDecisions.getUnit(topicType);
    return topicUnit;
  }

  /**
   * Gets the picture of a topic
   * @param topic topic of the element
   * @returns name of the picture
   */
  getPicture(topicType: string): string | null {
    const picture = SettingDecisions.getPicture(topicType);
    return picture;
  }


}
