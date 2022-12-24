import { Component } from '@angular/core';
import { MessagesService } from 'src/app/api/messages.service';
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

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService) {
  }


  ngOnInit() {
    this.requestMessages();
  }

  /**
   * Subscribes to the api to get message data
   */
  private requestMessages(): void {
    this.messagesService.getMessages('', [], false, false, 7).subscribe(data => {
      if (data.body && data.body.payload) {
        const topicList: ITopicList = data.body.payload;
        this.messagesTree.replaceManyNodes(topicList);
        this.setNavItems(this.topicChunks);
      }
    })
  }

  /**
   * Sets the nav items to the selections of the current menu position
   * @param topic topic string of the current menu position
   */
  private setNavItems(topicChunks: string[]) {
    this.curNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
    if (this.curNode) {
      const curChunk = this.topicChunks.at(-1)
      const childs = this.curNode.childs;
      const navItems = [];
      if (curChunk) {
        navItems.push('<');
        navItems.push(curChunk)
      } else {
        navItems.push('favorites')
      }
      for (const topicChunk in childs) {
        navItems.push(topicChunk);
      }
      this.navItems = navItems;
    }
  }

  /**
   * Selects a new item
   * @param topicChunk chunk of the topic that is selected
   */
  public selectItem(topicChunk: string) {
    const curChunk = this.topicChunks.at(-1);
    if (topicChunk === '<') {
      this.topicChunks.pop();
    } else if (topicChunk !== curChunk && topicChunk !== 'favorites') {
      this.topicChunks.push(topicChunk);
    }
    this.setNavItems(this.topicChunks);
  }
}
