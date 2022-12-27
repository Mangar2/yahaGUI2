import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { MessagesService } from 'src/app/api/messages.service';
import { IMessages } from 'src/app/data/message';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';
import { MessageTreeService } from 'src/app/data/message-tree.service';
import { SubscribeService } from 'src/app/api/subscribe.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.less']
})
export class TopicsComponent {

  constructor(
    private settingsService: SettingsService,
    private messageAPI: MessagesService,
    private messageTree: MessageTreeService,
    private router: Router) {
  }

  @Input() messages: IMessages | null = null;
  subscribeService = new SubscribeService(this.messageAPI, this.messageTree);

  /**
   * Switches the value of a topic by sending a switch command
   * @param topic Switches the value of a topic (between on and off)
   */
  onSwitch(topic: string): void {
    console.log(topic);
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
    const chunks = topic.split('/');
    const last = chunks ? chunks.pop() : '';
    return last ? last : '';
  }

  /**
   * Gets a value of a topic
   * @param topic topic to get the value
   * @returns value of the topic
   */
  getValue(topic: string): string | number {
    let result: string | number = "";
    if (this.messages !== null) {
      for (const message of this.messages) {
        if (message.topic === topic) {
          result = message.value;
          break;
        }
      }
    }
    return result;
  }

  /**
   * Checks, if a topic is a switch
   * @param topic topic to check
   * @returns true, if the topic is a swith
   */
  isSwitch(topic: string): boolean {
    const settings = this.settingsService.getNavSettings(topic.split('/'));
    const topicType = settings.getTopicType();
    let result = false;
    if (topicType === 'Switch') {
      result = true;
    } else if (topicType === 'Automatic') {
      const value = String(this.getValue(topic)).toLowerCase();
      result = value === 'on' || value === 'off';
    }
    return result;
  }

  /**
   * Checks, if a switch is on
   * @param topic topic to identify the switch
   * @returns true, if the switch is on
   */
  isSwitchOn(topic: string): boolean {
    const value = String(this.getValue(topic)).toLowerCase();
    return value === 'on' || value === '1' || value === 'true';
  }

  /**
   * Stops propagation of a click event
   * @param event click event
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Publishes a new value for a topic
   * @param topic topic to publish
   * @param value value to publish
   */
  publishChange(topic: string, value: string): void {
    this.messageAPI.publish(topic, value).subscribe(resp => {
      if (resp.status !== 200 || resp.body !== "puback") {
        console.log("Error while publishing a change: ");
        console.log(resp);
      } else {
        this.subscribeService.poll(topic, value);
      }
    });
  }

  /**
   * Handles a switch change
   * @param topic of the element
   * @param event change event
   */
  onChange(topic: string, event: any): void {
    const newValue = event.checked ? 'on' : 'off';
    this.publishChange(topic, newValue);
  }

  /**
   * We need to unsubscribe to everything before leaving this view
   */
  ngOnDestroy() {
    this.subscribeService.unsubscribe();
  }


}
