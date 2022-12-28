
/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Subscription manager service
 */

import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription, take, timer } from "rxjs";
import { MessageTreeService } from "../data/message-tree.service";
import { IResponseBody, MessagesService } from "./messages.service";

@Injectable({
  providedIn: 'root'
})
export class ChangeService {

  hasPendingRequest = false;

  constructor(private messageService: MessagesService,
    private messageTree: MessageTreeService) {
  }

  /**
   * Sets, if there is already a pending request
   * @param state pending request state
   */
  setPendingRequest(state: boolean) {
    this.hasPendingRequest = state;
  }

  /**
   * Publishes a new value for a topic
   * @param topic topic to publish
   * @param value value to publish
   */
  publishChange(topic: string, value: string, pollCount = 5, callback: Function): Subscription {
    const subscription = new Subscription();
    const messageObservable = this.messageService.getMessages(topic, [], false, false, 0)
    const pollForUpdate = timer(500, 500).pipe(take(pollCount))

    subscription.add(this.messageService.publish(topic, value).subscribe(resp => {
      if (resp.status !== 200 || resp.body !== "puback") {
        console.log("Error while publishing a change: ");
        console.log(resp);
      } else {
        subscription.add(pollForUpdate.subscribe({
          next: () => {
            subscription.add(messageObservable.subscribe(resp => {
              const validated = this.setAndCheckResult(resp, topic, value);
              if (validated) {
                subscription.unsubscribe();
                callback();
              }
            }))
          },
          error: () => { callback(); },
          complete: () => { callback(); }
        }))
      }
    }));
    return subscription;
  }

  /**
   * Gets a value from a topic
   * @param topic topic to get value from
   */
  public getValueFromTopic(topic: string): string | null {
    const newMessage = this.messageTree.getNodeByTopic(topic);
    let result: string | null = null;
    if (newMessage && newMessage.value && newMessage.topic === topic) {
      result = String(newMessage.value);
    }
    return result;
  }

  /**
   * Sets a result of a getmessage call and checks the result agains an expected value
   * @param resp the getmessage call result
   * @param topic the relevant topic
   * @param expectedValue the expected value of the topic
   * @returns true, if the result shows that the topic now has the expected value
   */
  private setAndCheckResult(resp: HttpResponse<IResponseBody>, topic: string, expectedValue: string): boolean {
    this.messageTree.setHttpResult(resp);
    const value = this.getValueFromTopic(topic);
    const result = value !== null && value === expectedValue;
    return result;
  }

}