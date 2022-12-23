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
  topic = '';
  curChunk = '';
  navItems = ['<', 'first', 'second']

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService) {
  }

  ngOnInit() {
    this.messagesService.getMessages('', [], false, false, 7).subscribe(data => {
      if (data.body && data.body.payload) {
        const topicList: ITopicList = data.body.payload;
        this.messagesTree.replaceManyNodes(topicList);
        this.setNavItems(this.topic);
      }
    })
  }

  /**
   * Sets the nav items to the selections of the current menu position
   * @param topic topic string of the current menu position
   */
  setNavItems(topic: string) {
    this.curNode = this.messagesTree.getNodeByTopic(topic);
    if (this.curNode) {
      const childs = this.curNode.childs;
      const navItems = [];
      if (this.curChunk !== '') {
        navItems.push('<');
        navItems.push(this.curChunk)
      } else {
        navItems.push('favorites')
      }
      for (const topicChunk in childs) {
        navItems.push(topicChunk);
      }
      this.navItems = navItems;
    }
  }
}
