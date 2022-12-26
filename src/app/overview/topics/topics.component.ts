import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IMessages } from 'src/app/data/message';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.less']
})
export class TopicsComponent {

  constructor(
    private settingsService: SettingsService,
    private router:Router) {
  }

  @Input() messages: IMessages | null = null;

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
  viewDetails(topic:string): void {
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
    const last = chunks ? chunks.pop(): '';
    return last ? last: '';
  }

  /**
   * Checks, if a topic is a switch
   * @param topic topic to check
   * @returns true, if the topic is a swith
   */
  isSwitch(topic: string): boolean {
    const settings = this.settingsService.getNavSettings(topic.split('/'));
    const topicType = settings.getTopicType();
    return topicType === 'Switch';
  }

  /**
   * Stops propagation of a click event
   * @param event click event
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

}
