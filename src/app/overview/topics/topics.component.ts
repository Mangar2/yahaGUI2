import { Component, Input, Directive, ViewChildren, QueryList } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IMessage, IMessages } from 'src/app/data/message';
import { SettingsService } from 'src/app/settings/settings.service';
import { ChangeService } from 'src/app/api/change.service';
import { Subscription } from 'rxjs'
import { SettingDecisions } from 'src/app/settings/setting-decisions';
import { DisplaynameService } from 'src/app/settings/displayname.service';


@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.less']
})
export class TopicsComponent {

  subscription: Subscription | null = null;
  updatingTopics: { [index:string]: boolean } = {};

  constructor(
    private settingsService: SettingsService,
    private changeService: ChangeService,
    private displaynameService: DisplaynameService,
    private router: Router) {
  }

  @Input() messages: IMessages | null = null;

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
    return this.displaynameService.deriveDisplayName(topic.split('/'));
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
    if (this.updatingTopics[topic] === true) {
      return;
    }
    this.updatingTopics[topic] = true;
    this.subscription = this.changeService.publishChange(topic, newValue, 10, () => { 
      const curValue = this.changeService.getValueFromTopic(topic);
      if (curValue) {
        event.source.checked = curValue === 'on';
        this.setValue(topic, curValue);
        this.updatingTopics[topic] = false;
      }
    });
  }

  /**
   * We need to unsubscribe to everything before leaving this view
   */
  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }


}
