/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview Controller-Component giving a detail view to a topic. It organizes data and includes
 * all views.
 * This controller polls for updates. In the normal cycle, it 
 * - Checks every every timespan for the current value including the last message timestamp
 * - Requests a full update (including history), if there is an information with newer timestamp
 * If the value has been changed, a change detection starts, it
 * - Checks more often (every 700ms) for an update 
 * - Stops, once the new value is reported by the server (and thus successfully applied)
 * - Prevents the normal update cycle until the requested value change has been found
 */


import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ChangeService } from 'src/app/api/change.service';
import { MessagesService } from 'src/app/api/messages.service';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { GlobalSettingsService } from 'src/app/settings/global-settings.service';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';


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
    private globalSettings: GlobalSettingsService,
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
    const refreshRateInMilliseconds = this.globalSettings.getDetailViewRefreshInMilliseconds();
    const pollForUpdate = timer(refreshRateInMilliseconds, refreshRateInMilliseconds);

    this.subscription.add(pollForUpdate.subscribe( () => {
      // We do not poll for updates, if there is a value change polling already running
      if (this.isUpdatingTopic) {
        return;
      }
      this.subscription.add(valueObservable.subscribe(resp => {
        const oldTime = this.topicNode?.time;
        this.messagesTree.setHttpResult(resp);
        const newNode = this.messagesTree.getNodeByTopicChunks(topicChunks);
        if (!oldTime || newNode?.time !== oldTime) {
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
    // We copy the node to enable automatic updating of the view
    // Just assigning the node might just keep the node-reference and is thus
    // not identified as an update
    const newNode : IStorageNode = {...updatedNode}
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
    const valueChangePollAmount = this.globalSettings.getValueChangePollAmount();
    this.isUpdatingTopic = true;
    this.subscription.add(this.changeService.publishChange(topic, newValue, valueChangePollAmount, () => {
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
