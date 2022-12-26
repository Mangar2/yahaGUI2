import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MessagesService } from 'src/app/api/messages.service';
import { IMessages } from 'src/app/data/message';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { ITopicList } from 'src/app/data/topic_data';

@Component({
  selector: 'app-overview-screen',
  templateUrl: './overview-screen.component.html',
  styleUrls: ['./overview-screen.component.less']
})
export class OverviewScreenComponent {
  title = 'yahaGUI2';

  curNode: IStorageNode | null = null;
  topicChunks: string[] = [];
  navItems: string[] = []
  topics: IMessages = [];

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  /**
   */
  ngOnInit() {
    this.requestMessages();
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
      this.setTopics(this.curNode);
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
   * Sets the topics of the current node. Topics are child elements having a topic and a value
   * @param curNode current node in the message tree
   */
  private setTopics(curNode: IStorageNode) {
    const childs = curNode.childs;
    const topics: IMessages = [];
    for (const topicChunk in childs) {
      const child = childs[topicChunk];
      if (child.value && child.topic) {
        topics.push ({
          value: child.value,
          topic: child.topic
        })
      }
    }
    this.topics = topics;
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
}
