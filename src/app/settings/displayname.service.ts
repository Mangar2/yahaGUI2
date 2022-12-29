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
import { MessageTreeService } from '../data/message-tree.service';

@Injectable({
  providedIn: 'root'
})
export class DisplaynameService {

  constructor(private messageTree: MessageTreeService) { }

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
   * Checks, if the last topic chunk is ambiguous and if so, looks for an
   * unambigous prefix
   * @param topicChunks list of string elements in the topic
   */
  private getUnambiguousPrefix(topicChunks: string[]): string {
    let result: string = "";
    let isLast = true;
    for (let index = topicChunks.length - 1; index >= 0; index--) {
      const chunk = topicChunks[index];
      const wordCount = this.messageTree.getWordCount(chunk);
      if (wordCount <= 1) {
        if (!isLast) {
          result = chunk + ' ';
        }
        break;
      }
      isLast = false;
    }
    return result;
  }

 /**
  * Calculates the display name of the element
  * @param topicChunks list of elements of the topic
  * @returns the calculated display name of the element
  */
  deriveDisplayName(topicChunks: string[]): string {
    const lastChunk = topicChunks.at(-1);
    if (lastChunk === undefined) {
      return "No topic"
    }
    let result = lastChunk;
    result = result.toLocaleLowerCase();
    // Names starting with pc
    if (result.startsWith('pc') && !result.startsWith('pc ')) {
      result = 'PC ' + result.slice(2);
    }
    result = this.getUnambiguousPrefix(topicChunks) + result;
    result = this.capitalizeFirstLetters(result);
    return result;
  }
}
