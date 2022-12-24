import { Component, Input } from '@angular/core';
import { IMessages } from 'src/app/data/message';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.less']
})
export class TopicsComponent {

  @Input() messages: IMessages | null = null;

  /**
   * Switches the value of a topic by sending a switch command
   * @param topic Switches the value of a topic (between on and off)
   */
  onSwitch(topic: string): void {
    console.log(topic);
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

}
