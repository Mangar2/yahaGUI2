/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Class holding a tree of messages. The tree is organized according to the message topics.
 */

import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponseBody } from '../api/messages.service';
import { IHistoryList, IReasons } from './message';
import { ITopicData, ITopicList } from './topic_data';

/**
 * Node of the device tree
 */
 export interface IStorageNode {
  childs: { [key:string]: IStorageNode } | null,
  topic?: string,
  value?: string | number,
  time?: string,
  reason?: IReasons,
  history?: IHistoryList,
  debug?: boolean
}

class StorageNode implements IStorageNode {
  childs: { [key:string]: StorageNode } | null = null;
  topic?: string;
  value?: string | number;
  time?: string;
  reason?: IReasons;
  history?: IHistoryList;
  debug?: boolean;

  /**
   * Checks, if the node has childs
   * @returns true, if the node has childs
   */
  public hasChilds(): boolean {
    return this.childs !== null && Object.keys(this.childs).length !== 0;
  }

  /**
   * Gets a child by its topic-link
   * @param topicChunk element of the topic string
   * @returns child found or null
   */
  public getChild(topicChunk: string): StorageNode | null {
    let result = null;
    if (this.childs !== null && this.childs[topicChunk]) {
      result = this.childs[topicChunk];
    }
    return result;
  }

  /**
   * Sets the node values from a message
   * @param message message with topic, value and reason
   */
  public setValuesFromMessage(topicData: ITopicData) {
    this.topic = topicData.topic;
    this.value = topicData.value;
    this.time = topicData.time;
    this.reason = topicData.reason;
    // Do not delete the old history, if a new call did not provide it
    if (topicData.history) {
      this.history = topicData.history;
    }
  }
}

type IStorageNodes = IStorageNode[]

@Injectable({
  providedIn: 'root'
})
export class MessageTreeService {

  tree: StorageNode = new StorageNode;
  wordCount: { [index:string]: number} = {}

  constructor() { }

  /**
   * Checks, if the storage is empty
   */
  public isEmpty() {
    return this.tree === undefined || !this.tree.hasChilds()
  }

  /**
   * Splits a topic by '/', removes the first element, if it is empty
   * @param topic topic string formatted like a link with 
   * @returns 
   */
  private getTopicChunks(topic: string): string[] {
    const topicChunks = topic.split('/')
    if (topicChunks[0] === '') {
      topicChunks.shift()
    }
    return topicChunks;
  }

  /**
   * Searches for a topic in a topic tree and return all matching nodes
   * @param topic topic of the current tree-node
   * @param topicChunks topic chunk-array to find the right node, supports '%' wildchard
   * @param node current node in the StorageNode tree
   * @returns array of matching nodes (may be empty)
   */
  private getAllMatchingNodesRec(topic: string, topicChunks: string[], node: StorageNode | null): IStorageNodes {
    let result: IStorageNodes = []
    const topicChunk = topicChunks[0]
    const childChunks = [...topicChunks]
    const hasChilds = node && node.hasChilds()
    if (topicChunk !== '#') {
      childChunks.shift()
    }

    if (!node) {
      result = []
    } else if (topicChunk === undefined) {
      node.topic = topic
      result = [node]
    } else if (!hasChilds && topicChunk === '#') {
      node.topic = topic
      result = [node]
    } else if (topicChunk === '%' || topicChunk === '#') {
      for (const childChunk in node.childs) {
        const childNode = node.childs[childChunk]
        const childTopic = topic === '' ? childChunk : topic + '/' + childChunk
        const childResult = this.getAllMatchingNodesRec(childTopic, childChunks, childNode)
        result = [...result, ...childResult]
      }
    } else if (typeof (topicChunk) === 'string') {
      const childNode = node.getChild(topicChunk)
      const childTopic = topic === '' ? topicChunk : topic + '/' + topicChunk
      const childResult = this.getAllMatchingNodesRec(childTopic, childChunks, childNode)
      result = [...result, ...childResult]
    }
    return result
  }

  /**
   * Searches for a topic in a topic tree and return all matching nodes
   * @param topic topic string to find the right node, supports '%' and '#' wildchard
   * @returns nodes matching the topic or undefined if not found
   */
  public getAllMatchingNodes(topic: string): IStorageNodes {
    const topicChunks = this.getTopicChunks(topic);
    const result = this.getAllMatchingNodesRec('', topicChunks, this.tree)
    return result
  }

  /**
   * Gets a node by topic split to an array of chunks
   * @param topicChunks node topic chunks (path to the node)
   * @returns node found 
   */
  public getNodeByTopicChunks(topicChunks: string[]): IStorageNode | null {
    let node: StorageNode | null = this.tree
    for (const topicChunk of topicChunks) {
      if (!node) {
        break
      }
      node = node.getChild(topicChunk)
    }
    return node
  }

  /**
   * Gets a node by topic
   * @param topic node topic chunks (path to the node)
   * @returns node found 
   */
  public getNodeByTopic(topic: string): IStorageNode | null {
    const topicChunks = this.getTopicChunks(topic);
    return this.getNodeByTopicChunks(topicChunks);
  }

  /**
   * Adds a topic Chunk to a word count statistic
   * @param topicChunk current topic chunk
   */
  private addToWordCount(topicChunk: string) {
    if (this.wordCount[topicChunk] === undefined) {
      this.wordCount[topicChunk] = 1;
    } else {
      this.wordCount[topicChunk]++;
    }
  }

  /**
   * Returns the number of occurences of a word in the topic tree
   * @param topicChunk word to look for
   * @returns number of occurences of this word in the topic tree
   */
  public getWordCount(topicChunk: string): number {
    if (this.wordCount[topicChunk] === undefined) {
      return 0;
    }  else {
      return this.wordCount[topicChunk];
    }
  }

  /**
   * Adds a node to the tree, if it does not exists
   * @param topic topic of the node
   */
  private getNodeAndAddIfNotExists(topic: string): StorageNode {
    let node: StorageNode = this.tree
    const topicChunks = this.getTopicChunks(topic);
    for (const topicChunk of topicChunks) {
      if (!node.childs) {
        node.childs = {}
      }
      if (!node.childs[topicChunk]) {
        node.childs[topicChunk] = new StorageNode();
        this.addToWordCount(topicChunk);
      }
      node = node.childs[topicChunk]
    }
    return node
  }

  /**
   * Replaces (updates or inserts) a node in the tree
   * @param device device containing update information
   */
  private replaceSingleNode(message: ITopicData) {
    if (message.topic) {
      const node = this.getNodeAndAddIfNotExists(message.topic)
      node.setValuesFromMessage(message);
    }
  }

  /**
   * Replaces many nodes by data read from server
   * @param payload data read from server
   */
  public replaceManyNodes(payload: ITopicList) {
    if (payload) {
      for (let message of payload) {
        this.replaceSingleNode(message);
      }
    }
  }

  /**
   * Sets a result of a getmessage call and checks the result agains an expected value
   * @param resp the getmessage call result
   * @returns true, if the result shows that the topic now has the expected value
   */
  public setHttpResult(resp: HttpResponse<IResponseBody>): void {
    if (resp.status !== 200 || !resp.body || !resp.body.payload) {
      console.error("Error while calling http interface");
      console.error(resp);
    } else {
      const payload = resp.body.payload;
      this.replaceManyNodes(payload);
    }
  }
}

