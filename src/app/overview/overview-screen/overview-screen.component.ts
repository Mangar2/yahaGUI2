import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MessagesService } from 'src/app/api/messages.service';
import { IMessages } from 'src/app/data/message';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { ITopicList } from 'src/app/data/topic_data';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-overview-screen',
  templateUrl: './overview-screen.component.html',
  styleUrls: ['./overview-screen.component.less']
})
export class OverviewScreenComponent {

  curNode: IStorageNode | null = null;
  topicChunks: string[] = [];
  navItems: string[] = []
  messages: IMessages = [];
  settings: INavSettings | null = null;

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService,
    private settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  /**
   */
  ngOnInit() {
    this.requestMessages();
    this.subscribeToQueryParameter();
  }

  /**
   * Subscribes to the "topic" query parameters and updates the view on change
   */
  private subscribeToQueryParameter() {
    const topic = this.route.queryParamMap.subscribe(params => {
      const topic = params.get('topic');
      if (topic) {
        this.topicChunks = topic.split('/');
      } else {
        this.topicChunks = []
      }
      this.updateView(this.topicChunks);
    })
  }

  /**
   * Subscribes to the api to get message data
   */
  private requestMessages(): void {
    this.messagesService.getMessages('', [], false, false, 7).subscribe(data => {
      if (data.body && data.body.payload) {
        const topicList: ITopicList = data.body.payload;
        this.messagesTree.replaceManyNodes(topicList);
        this.updateView(this.topicChunks);
      }
    })
  }

  /**
   * Uddate the view, when the topic changed
   * @param topicChunks elements of the current topic
   */
  private updateView(topicChunks: string[]) {
    this.curNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
    if (this.curNode) {
      this.setNavItems(this.curNode);
      this.setMessages(this.curNode, topicChunks);
      this.settings = this.settingsService.getNavSettings(topicChunks);
    }
  }

  /**
   * Sets the nav items to the selections of the current menu position
   * @param topic topic string of the current menu position
   */
  private setNavItems(curNode: IStorageNode) {
    const curChunk = this.topicChunks.at(-1)
    const childs = curNode.childs;
    const navItems = [];
    if (curChunk) {
      navItems.push(curChunk);
      navItems.push('<');
    } else {
      navItems.push('favorites')
    }
    for (const topicChunk in childs) {
      navItems.push(topicChunk);
    }
    this.navItems = navItems;
  }

  /**
   * Gets the configured additional messages to show for the node
   * @param topicChunks current tree position
   * @returns list of additional messages to show in the current node 
   */
  private getConfiguredMessages(topicChunks: string[]): IMessages {
    const result: IMessages = [];
    const topic: string = topicChunks.join('/');
    const additionalTopics = this.settingsService.getAdditionalTopics(topic, topicChunks.length + 1);
    for (const additionalTopic of additionalTopics) {
      const node = this.messagesTree.getNodeByTopic(additionalTopic);
      if (node && node.value && node.topic) {
        result.push({
          value: node.value,
          topic: node.topic
        })
      }
    }
    return result;
  }

  /**
   * Sets the messages of the current node. Messages are child elements having a topic and a value
   * @param curNode current node in the message tree
   */
  private setMessages(curNode: IStorageNode, topicChunks: string[]) {
    const childs = curNode.childs;
    const settings = this.settingsService.getNavSettings(topicChunks);
    const topics: IMessages = this.getConfiguredMessages(topicChunks);
    for (const topicChunk in childs) {
      const child = childs[topicChunk];
      if (child.value !== undefined && child.topic && settings.isEnabled(topicChunk)) {
        topics.push ({
          value: child.value,
          topic: child.topic
        })
      }
    }
    this.messages = topics;
  }

  /**
   * Selects a new item
   * @param topicChunk chunk of the topic that is selected
   */
  public selectItem(topicChunk: string) {
    const curChunk = this.topicChunks.at(-1);
    let changed = false;
    if (topicChunk === '<') {
      this.topicChunks.pop();
      changed = true;
    } else if (topicChunk !== curChunk && topicChunk !== 'favorites') {
      this.topicChunks.push(topicChunk);
      changed = true;
    }
    if (changed) {
      this.updateView(this.topicChunks);
      const topic = this.topicChunks.join('/');
      const navigationExtras: NavigationExtras = {
        queryParams: { topic }
      };
      this.router.navigate([], navigationExtras);
    }
  }

  /**
   * Updates the view after a configuration change
   */
  public onConfigChange() {
    this.updateView(this.topicChunks);
  }
}
