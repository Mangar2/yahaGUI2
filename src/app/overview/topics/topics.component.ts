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
import { IMessage, IMessages } from 'src/app/data/message';
import { SettingsService } from 'src/app/settings/settings.service';
import { Subscription } from 'rxjs'
import { SettingDecisions } from 'src/app/settings/setting-decisions';
import { DisplaynameService } from 'src/app/settings/displayname.service';

export type IValueChangeInfo = {
  topic: string,
  value: string
}

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.less']
})
export class TopicsComponent {

  @Input() messages: IMessages | null = null;
  @Input() topicChunks: string[] = [];
  @Input() updatingTopics: { [index:string]: boolean } = {};

  @Output() valueChangeEvent = new EventEmitter<IValueChangeInfo>();

  subscription: Subscription | null = null;


  constructor(
    private settingsService: SettingsService,
    private displaynameService: DisplaynameService,
    private router: Router) {
  }


  ngOnChanges() {
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
   * Returns a message by its topic
   * @param topic of the message
   * @returns message 
   */
  private getMessageByTopic(topic: string): IMessage | null {
    if (this.messages !== null) {
      for (const message of this.messages) {
        if (message.topic === topic) {
          return message;
        }
      }
    }
    return null;
  }

  trimString(str: string | number, maxLen: number = 45): string {
    let result = String(str);
    if (result.length > maxLen) {
      result = result.slice(0, maxLen - 4) + '...';
    }
    return result;
  }

  /**
   * Gets a value of a topic
   * @param topic topic to get the value
   * @returns value of the topic
   */
  getValue(topic: string): string | number {
    const message = this.getMessageByTopic(topic);
    return message ? message.value : "";
  }

  /**
   * Sets the value of a message identified by its topic
   * @param topic topic of the message
   * @param value new value of the message
   */
  setValue(topic: string, value: string) {
    const message = this.getMessageByTopic(topic);
    if (message) {
      message.value = value;
    }
  }

  /**
   * Checks, if a topic is a switch
   * @param topic topic to check
   * @returns true, if the topic is a swith
   */
  isSwitch(topic: string): boolean {
    const settings = this.settingsService.getNavSettings(topic.split('/'));
    const topicType = settings.getTopicType();
    return SettingDecisions.isSwitch(topicType, this.getValue(topic));
  }

  /**
   * Checks, if a switch is on
   * @param topic topic to identify the switch
   * @returns true, if the switch is on
   */
  isSwitchOn(topic: string): boolean {
    return SettingDecisions.isSwitchOn(this.getValue(topic))
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
   * Gets the unit string of the topic value
   * @returns unit string
   */
  getUnit(topic: string): string {
    const topicChunks = topic.split('/');
    const lastChunk = topicChunks.at(-1);
    const navSettings = this.settingsService.getNavSettings(topic.split('/'));
    const topicType = SettingDecisions.decideType(navSettings.getTopicType(), lastChunk, null);
    const topicUnit = SettingDecisions.getUnit(topicType);
    return topicUnit;
  }


}
