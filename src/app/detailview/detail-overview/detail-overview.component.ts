import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ChangeService } from 'src/app/api/change.service';
import { MessagesService } from 'src/app/api/messages.service';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';

const REFRESH_RATE_IN_MILLISECONDS = 2 * 1000;

@Component({
  selector: 'app-detail-overview',
  templateUrl: './detail-overview.component.html',
  styleUrls: ['./detail-overview.component.less']
})
export class DetailOverviewComponent {

  subscription: Subscription = new Subscription;
  topicNode: IStorageNode | null = null;
  topicChunks: string[] | null = null;
  navSettings: INavSettings | null = null;
  isUpdatingTopic = false;

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService,
    private settingsService: SettingsService,
    private changeService: ChangeService,
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
    this.route.queryParamMap.subscribe(params => {
      const topic = params.get('topic');
      if (topic) {
        this.topicChunks = topic.split('/');
      } else {
        this.topicChunks = []
      }
      this.navSettings = this.settingsService.getNavSettings(this.topicChunks);
      this.initializeNode(this.topicChunks);
      this.pollNode(this.topicChunks);
    })
  }

  /**
   * Updates the current node and shows the result
   * @param topicChunks path to current node
   */
  private initializeNode(topicChunks: string[]) {
    // Child Depth 1 ensures, that all direct childs are also fetched. The child with the name "set" indicates, that
    // the current node has been changed by a set command -> thus it is a changable parameter and not only an information
    // This will be used for auto-detecting the type of a node
    const CHILD_DEPTH = 1;
    this.requestNewHistoryInfo(topicChunks, CHILD_DEPTH);
  }

  /**
   * polls for infos
   * @param topicChunks path to the current node
   */
  private pollNode(topicChunks: string[]) {
    const topic: string = topicChunks.join('/')
    const valueObservable = this.messagesService.getMessages(topic, [], false, true, 0)

    const pollForUpdate = timer(REFRESH_RATE_IN_MILLISECONDS, REFRESH_RATE_IN_MILLISECONDS);

    this.subscription.add(pollForUpdate.subscribe( () => {
      this.subscription.add(valueObservable.subscribe(resp => {
        const oldTime = this.topicNode?.time;
        this.messagesTree.setHttpResult(resp);
        const newNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
        if (!oldTime || newNode?.time !== oldTime) {
          console.log("new history request");
          this.requestNewHistoryInfo(topicChunks);
        }
      }))
    }))
  }

  /**
   * 
   * @param observable observable for the http request
   * @param topicChunks link to the current node
   */
  private requestNewHistoryInfo(topicChunks:string[], depth: number = 0) {
    const topic: string = topicChunks.join('/')
    const historyObservable = this.messagesService.getMessages(topic, [], true, true, depth)
    this.subscription.add(historyObservable.subscribe(resp => {
      this.messagesTree.setHttpResult(resp);
      this.updateView(topicChunks);
    }))
  }

  /**
   * Uddate the view, when the topic changed
   * @param topicChunks elements of the current topic
   */
  private updateView(topicChunks: string[]) {
    const updatedNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
    if (!updatedNode) {
      return;
    }
    const newNode : IStorageNode = {
      childs: updatedNode.childs,
      topic: updatedNode.topic,
      value: updatedNode.value,
      time: updatedNode.time,
      reason: updatedNode.reason,
      history: updatedNode.history,
      debug: updatedNode.debug
    }
    this.topicNode = newNode;
  }

  /**
   * Called, if settings changed
   */
  public onSettingChange() {
    if (this.topicChunks) {
      this.navSettings = this.settingsService.getNavSettings(this.topicChunks).copy();
    }
  }

  /**
   * Called, if the value of the current topic node shall be changed
   * Sends the new value to the server and polls it to check, if it has been applied
   * @param newValue new value of the current topic node
   */
  public onValueChange(newValue: string) {
    if (!this.topicChunks) {
      return;
    }
    const topic = this.topicChunks.join('/');
    this.isUpdatingTopic = true;
    this.subscription.add(this.changeService.publishChange(topic, newValue, 10, () => {
      this.topicNode = this.messagesTree.getNodeByTopic(topic);
      if (this.topicNode && this.topicNode.value) {
        this.isUpdatingTopic = false;
      }
    }));
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
