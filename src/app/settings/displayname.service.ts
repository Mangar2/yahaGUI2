/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Service calculating a display name of an element by its topic
 */

import { Injectable } from '@angular/core';
import { IStorageNode, MessageTreeService } from '../data/message-tree.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DisplaynameService {

  unitPostFixes = {
    " in celsius": '°C',
    " in percent": '%rH'
  }

  constructor(
    private messageTree: MessageTreeService,
    private settingsService:SettingsService ) { }

  /**
   * Capitalize all first letters of a name
   * @param name name to capitalize all first letters
   * @returns name with capitalized first letters
   */
  capitalizeFirstLetters(name: string): string {
    const chunks = name.split(' ');
    let resultFld: string[] = [];
    for (const chunk of chunks) {
      resultFld.push(chunk.charAt(0).toLocaleUpperCase() + chunk.slice(1));
    }
    return resultFld.join(' ');
  }

  /**
   * Count the amount of positions leading to the same name in the subtree
   * @param wordChunks Current name separated in sub-names
   * @param curNode Current node in the message tree
   * @param cutoff amount of occurences found to cutoff the search
   * @param chunkPos position in the wordChunk while searching recursively
   * @returns Amount of occurences of the same name in the tree
   */
  private countWordsRec(wordChunks:string[], curNode: IStorageNode, cutoff = 2): number {
    if (wordChunks.length === 0) {
      return 1;
    }
    const childs = curNode.childs;
    let result = 0;
    for (const chunk in childs) {
      const childNode = childs[chunk];
      if (wordChunks[0] === chunk) {
        let wordChunksCopy = [...wordChunks];
        wordChunksCopy.shift();
        result += this.countWordsRec(wordChunksCopy, childNode, cutoff)
      } else {
        result += this.countWordsRec(wordChunks, childNode, cutoff);
      }
      if (result >= cutoff) {
        break;
      }
    }
    return result;
  } 

  /**
   * Retrieves the number of identical names in the current subtree by
   * travesing the tree from the start-position identified by curTopicChunks
   * @param wordChunks Name to check
   * @param curTopicChunks Name display position in the topic tree
   * @returns the amount of identical names found in the same subtree
   */
  private getWordCount(wordChunks: string[], curTopicChunks: string[]): number {
    const curNode = this.messageTree.getNodeByTopicChunks(curTopicChunks);
    const wordCount = curNode ? this.countWordsRec(wordChunks, curNode) : 0;
    // return this.messageTree.getWordCount(wordChunks[0]);
    return wordCount;
  }

  /**
   * Checks, if the last topic chunk is ambiguous and if so, looks for an
   * unambigous prefix
   * @param topicChunks list of string elements in the topic
   * @param curTopicChunks Name display position in the topic tree
   * @param curName Name of the element so far
   */
  private getUnambiguousPrefix(topicChunks: string[], curTopicChunks: string[], curName: string): string {
    const subtopic = topicChunks.at(-1);
    if (subtopic === undefined) {
      return "";
    }
    let alreadyUnique = this.getWordCount([subtopic], curTopicChunks) <= 1;
    if (alreadyUnique) {
      return "";
    }
    const prefixProposal: string[] = []
    // Always use the room if the item itself is not unambigous and the current position is at
    // more general than room-level
    const isCrossRooms = curTopicChunks.length <= 1 && topicChunks.length >= 1;
    if (isCrossRooms && curName != topicChunks[1]) {
      prefixProposal.push(topicChunks[1])
      alreadyUnique = this.getWordCount([...prefixProposal, subtopic], curTopicChunks) <= 1;
    }
    for (let index = topicChunks.length - 2; index >= 2; index--) {
      if (alreadyUnique) {
        break;
      }
      const curChunk = topicChunks[index];
      alreadyUnique = this.getWordCount([...prefixProposal, curChunk, subtopic], curTopicChunks) <= 1;
      // Do not add switch as the are already identified by a slider
      // Always add second element, even if it is still not unique
      // Don´t add a name it already has (e.g. leading to "light light")
      if ((alreadyUnique || index == 2) && curChunk !== 'switch' && curChunk !== curName) { 
        prefixProposal.push(curChunk);
      }
    }
    prefixProposal.push('');
    return prefixProposal.join(' ');
  }

  /**
   * Derives a name from a topic type
   * @param topicChunks list of elements in the topic
   * @returns A configured topic type
   */
  private deriveNameBasedOnTopicType(topicChunks: string[]): string {
    const topicType = this.settingsService.getNavSettings(topicChunks).getTopicType();
    const lastChunk = topicChunks.at(-1);
    let result = "No topic"
    if (topicType === 'Light' || topicType === 'Window') {
      result = topicType;
    } else if (lastChunk !== undefined) {
      result = lastChunk;
    }
    return result;
  }

  /**
   * Remove postfix strings showing units
   * @param name current name
   * @returns new name without postfix
   */
  private removeUnitPostfix(name: string): string {

    let result = name;
    for (const postFix in this.unitPostFixes) {
      if (name.endsWith(postFix)) {
        result = name.slice(0, -postFix.length);
        break;
      }
    }
    return result;
  }

 /**
  * Calculates the display name of the element
  * @param topicChunks list of elements of the topic
  * @param curTopicChunks list of elements to the position where the name will be displayed
  * @returns the calculated display name of the element
  */
  deriveDisplayName(topicChunks: string[], curTopicChunks: string[] = []): string {
    let result = this.deriveNameBasedOnTopicType(topicChunks);
    result = result.toLocaleLowerCase();

    // Names starting with pc
    if (result.startsWith('pc') && !result.startsWith('pc ')) {
      result = 'PC ' + result.slice(2);
    }
    result = this.removeUnitPostfix(result);
    result = this.getUnambiguousPrefix(topicChunks, curTopicChunks, result) + result;
    result = this.capitalizeFirstLetters(result);
    return result;
  }
}
