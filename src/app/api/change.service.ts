
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

import { Injectable } from '@angular/core';
import { Subscription, take, timer } from "rxjs";
import { MessageTreeService } from "../data/message-tree.service";
import { MessagesService } from "./messages.service";

@Injectable({
  providedIn: 'root'
})
export class ChangeService {

    subscription: Subscription;
    hasPendingRequest = false;

    constructor(private messageService: MessagesService,
        private messageTree: MessageTreeService) {
        this.subscription = new Subscription();
    }

    /**
     * Sets, if there is already a pending request
     * @param state pending request state
     */
    setPendingRequest(state: boolean) {
        this.hasPendingRequest = state;
    }

    /**
     * Polls a subscription multiple times
     * @param topic topic to poll
     * @param expectedValue value to poll for
     * @param count Amount of polls
     * @param initialDelayInMs delay before the first poll
     * @param delayInMs delay between polls
     */
    poll(topic: string, expectedValue: string, count: number = 5, initialDelayInMs: number = 500, delayInMs: number = 500) {
        const pollForUpdate = timer(initialDelayInMs, delayInMs).pipe(take(count))
        this.subscription.add(pollForUpdate.subscribe(() => {
            if (!this.hasPendingRequest) {
                this.subscription.add(this.readUpdates(topic, expectedValue, false, false))
            }
        }))
    }

    /**
     * Read data from the server based on a topic
     * @param deviceTopic topic to fetch data for
     * @param requestHistory true, to add the history
     * @param requestReason true, if reason information will be added
     */
    readUpdates(topic: string, expectedValue: string, requestHistory: boolean, requestReason: boolean): Subscription {
        const messageObservable = this.messageService.getMessages(topic, [], requestHistory, requestReason, 1)

        return messageObservable.subscribe(resp => {
            console.log(resp);
            if (resp.status !== 200 || !resp.body || !resp.body.payload) {
                console.log("Error while polling for updates: ");
                console.log(resp);
                return;
            }
            const payload = resp.body.payload;
            this.messageTree.replaceManyNodes(payload);
            const newMessage = this.messageTree.getNodeByTopic(topic);
            if (newMessage && newMessage.topic === topic && newMessage.value === expectedValue) {
                console.log("got expected value");
            }
        })
    }

    /**
     * Cancels all tasks from observables held by this subscription
     */
    unsubscribe() {
        this.subscription.unsubscribe();
    }

}