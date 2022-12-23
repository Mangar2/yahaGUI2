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
  topic = '/';

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService) {
  }

  ngOnInit() {
    this.messagesService.getMessages('', [], false, false, 7).subscribe(data => {
      if (data.body && data.body.payload) {
        const topicList: ITopicList = data.body.payload;
        this.messagesTree.replaceManyNodes(topicList);
        this.curNode = this.messagesTree.getNodeByTopic(this.topic);
      }
    })
  }
}
