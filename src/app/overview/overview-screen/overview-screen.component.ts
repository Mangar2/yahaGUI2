/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview Controller-Component giving an overview over all topics
 * This controller polls for updates.  
 */

import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ChangeService } from 'src/app/api/change.service';
import { MessagesService } from 'src/app/api/messages.service';
import { IMessages } from 'src/app/data/message';
import { IStorageNode, MessageTreeService } from 'src/app/data/message-tree.service';
import { ITopicList } from 'src/app/data/topic_data';
import { GlobalSettingsService } from 'src/app/settings/global-settings.service';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';
import { IValueChangeInfo } from '../topics/topics.component';

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
  subscription: Subscription = new Subscription;
  updatingTopics: { [index:string]: boolean } = {};

  constructor(
    private messagesService: MessagesService,
    private messagesTree: MessageTreeService,
    private changeService: ChangeService,
    private settingsService: SettingsService,
    private globalSettings: GlobalSettingsService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  /**
   */
  ngOnInit() {
    this.requestMessages([]);
    this.subscribeToQueryParameter();
    this.pollNode();
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
  private requestMessages(topicChunks: string[]): void {
    const topic = topicChunks.join('/')
    this.subscription.add(this.messagesService.getMessages(topic, [], false, false, 7).subscribe(data => {
      if (data.body && data.body.payload) {
        const topicList: ITopicList = data.body.payload;
        this.messagesTree.replaceManyNodes(topicList);
        this.updateView(this.topicChunks);
      }
    }))
  }

  /**
   * polls for infos
   * @param topicChunks path to the current node
   */
  private pollNode() {
    const refreshRateInMilliseconds = this.globalSettings.getOverviewRefreshInMilliseconds();
    const pollForUpdate = timer(refreshRateInMilliseconds, refreshRateInMilliseconds);

    this.subscription.add(pollForUpdate.subscribe(() => {
      // We do not poll for updates, if there is a value change polling already running
      let alreadyUpdating = false;
      for (const key in this.updatingTopics) {
        if (this.updatingTopics[key] === true) {
          alreadyUpdating = true;
          break;
        }
      }
      if (!alreadyUpdating) {
        this.requestMessages(this.topicChunks);
      }
    }))
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
      if (node && node.value !== undefined && node.topic) {
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
        topics.push({
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

  /**
   * Called, when a value change is requested and we wait for an answer
   * @param topic topic the value change is requested for
   */
  public onValueChange(valueChange: IValueChangeInfo) {
    //return;
    if (this.updatingTopics[valueChange.topic] === true) {
      return;
    }
    this.updatingTopics[valueChange.topic] = true;
    this.subscription.add(this.changeService.publishChange(valueChange.topic, valueChange.value, 10, () => { 
      if (this.curNode) {
        this.setMessages(this.curNode, this.topicChunks);
      }
      this.updatingTopics[valueChange.topic] = false;

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
