/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Service getting lists of messages from an api
 */

import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ITopicList } from 'src/app/data/topic_data';
import { IMessages } from 'src/app/data/message';
import { environment } from 'src/environments/environment';

export interface IResponseBody {
    payload: ITopicList | null;
}

export type HttpMessageResponse = Observable<HttpResponse<IResponseBody>>;

/**
 * Result structure of a publish command
 */
type PublishResult = string;

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    host = environment.apiHost;

    constructor(private httpClient: HttpClient) { }

    /**
     * Gets device infos from the server
     * @param topic topic string to identify the device, leave empty to get all devices
     * @param nodes list of nodes to retrieve, if null or empty, all nodes are retrieved
     * @param history true, if history data will be added
     * @param reason true, if reason information will be added
     * @param levelAmount amount of data level to retrieve
     */
    getMessages(topic: string, nodes: IMessages, history: boolean,
        reason: boolean = true, levelAmount: number = 1): HttpMessageResponse {
        // The app uses '|' instead of '/' to get around angular routing, the interface needs '/'
        topic = topic.split('|').join('/')
        const data = {
            topic,
            history: history ? "true" : "false",
            reason: reason ? "true" : "false",
            nodes,
            levelAmount
        }
        const observable =
            this.httpClient.post<IResponseBody>(this.host + "angular/api/sensor.php", data, { observe: 'response' });
        return observable
    }

    /**
     * publish data to the sensor interface
     * @param topic topic to look for
     * @param value value to set
     */
    publish(topic: string, value: string, append: string = '/set'): Observable<HttpResponse<PublishResult>> {
        const data = {
            topic: topic + append,
            value: value,
            timestamp: (new Date()).toISOString()
        }
        return this.httpClient.post<PublishResult>(this.host + "angular/api/publish.php", data, { observe: 'response' });
    }

    /**
     * Stores configuration
     * @param topic path to the configuration
     * @param payload configuration to store
     * @returns observable
     */
    storeConfig(topic: string, payload: any): Observable<HttpResponse<string>> {
        return this.httpClient.post<string>(environment.configHost + topic, payload, { observe: 'response' });
    }

    /**
     * Stores configuration
     * @param topic path to the configuration
     * @returns observable
     */
    readConfig(topic: string): Observable<HttpResponse<any>> {
        return this.httpClient.get<any>(environment.configHost + topic, { observe: 'response' });
    }

}
