import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MessagesService } from 'src/app/api/messages.service';
import { IMessages } from 'src/app/data/message';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { ITopicList } from 'src/app/data/topic_data';

@Component({
  selector: 'app-detail-overview',
  templateUrl: './detail-overview.component.html',
  styleUrls: ['./detail-overview.component.less']
})
export class DetailOverviewComponent {

  curNode: IStorageNode | null = null;
  topicChunks: string[] = [];
  nodeName: string = "";
  nodeValue: string = "";

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  
  /**
   */
  ngOnInit() {
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
   * Uddate the view, when the topic changed
   * @param topicChunks elements of the current topic
   */
    private updateView(topicChunks: string[]) {
      console.log(this.messagesTree);
      this.curNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
      console.log(this.curNode);
      const nodeName = topicChunks.at(-1);
      this.nodeName = nodeName ? nodeName : 'Unknown, an error occured';
      if (this.curNode && this.curNode.value) {
        this.nodeValue = this.curNode.value.toString();
      }
    }

}
