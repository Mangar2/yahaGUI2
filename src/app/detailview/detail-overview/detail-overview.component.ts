import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChangeService } from 'src/app/api/change.service';
import { MessagesService } from 'src/app/api/messages.service';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-detail-overview',
  templateUrl: './detail-overview.component.html',
  styleUrls: ['./detail-overview.component.less']
})
export class DetailOverviewComponent {

  subscription: Subscription | null = null;
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
      this.updateNode(this.topicChunks);
    })
  }

  /**
   * Updates the current node and shows the result
   * @param topicChunks path to current node
   */
  private updateNode(topicChunks: string[]) {
    // Child Depth 1 ensures, that all direct childs are also fetched. The child with the name "set" indicates, that
    // the current node has been changed by a set command -> thus it is a changable parameter and not only an information
    // This will be used for auto-detecting the type of a node
    const CHILD_DEPTH = 1;
    const messageObservable = this.messagesService.getMessages(topicChunks.join('/'), [], true, true, CHILD_DEPTH);
    messageObservable.subscribe(resp => {
      this.messagesTree.setHttpResult(resp);
      this.updateView(topicChunks);
    })
  }

  /**
   * Uddate the view, when the topic changed
   * @param topicChunks elements of the current topic
   */
  private updateView(topicChunks: string[]) {
    this.topicNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
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
    this.subscription = this.changeService.publishChange(topic, newValue, 10, () => {
      this.topicNode = this.messagesTree.getNodeByTopic(topic);
      if (this.topicNode && this.topicNode.value) {
        this.isUpdatingTopic = false;
      }
    });
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
