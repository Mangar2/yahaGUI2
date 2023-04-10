import { Component, Input } from '@angular/core';
import { IClient } from 'src/app/api/clients.service';

type fieldInfo_t = { name: string, label: string, class: string, type: string }

@Component({
  selector: 'app-clients-detail',
  templateUrl: './clients-detail.component.html',
  styleUrls: ['./clients-detail.component.less']
})
export class ClientsDetailComponent {

  _client: IClient | null = null;
  showFields: fieldInfo_t[][] = [
    [
      { label: "id", name: "_clientId", class: "client-small-input", type: "input" },
      { label: "host", name: "_host", class: "client-small-input", type: "input" },
      { label: "port", name: "_port", class: "client-small-input", type: "input" }
    ], 
    [
      { label: "status", "name": "status", class: "client-small-input", type: "input" },
      { label: "connected timestamp", "name": "connectTimestamp", class: "client-small-input", type: "input" },
      { label: "last active", "name": "lastActiveTimestamp", class: "client-small-input", type: "input" },
    ], 
    [
      { label: "version", "name": "version", class: "client-small-input", type: "input" },
      { label: "clean", "name": "clean", class: "client-small-input", type: "input" },
      { label: "keep alive (ms)", "name": "keepAlive", class: "client-small-input", type: "input" },
    ],     
    [
      { label: "send token", "name": "token.send", class: "client-small-input", type: "input" },
      { label: "receive token", "name": "token.receive", class: "client-small-input", type: "input" }
    ], 
    [
      { label: "subscribed pattern", "name": "pattern", class: "client-large-input", type: "textarea" }
    ], 
    [
      { label: "ordered topics queues", "name": "qos1Queue", class: "client-large-input", type: "textarea" }
    ], 
    [
      { label: "qos 0 queue", "name": "qos0Queue", class: "client-large-input", type: "textarea" }
    ], 
    [
      { label: "qos 2 queue", "name": "qos2Queue", class: "client-large-input", type: "textarea" }
    ]
  ]

  @Input()
  set client(client: IClient | null) {
    this._client = client;
  }

  /**
   * Gets data from the client in a displayable form
   * @param name name of the parameter to fetch
   */
  getData(name: string): string {
    if (this._client === null) {
      return "";
    }
    if (name === "token.send") {
      return this._client.token.send;
    } else if (name === "token.receive") {
      return this._client.token.receive;
    } else if (name === "pattern") {
      return JSON.stringify(this._client.subscribePattern._topicPatternList, null, 2);
    } else if (name === "qos0Queue") {
      return JSON.stringify(this._client._qos0Queue._queue, null, 2);      
    } else if (name === "qos2Queue") {
      return JSON.stringify(this._client.qos2Queue, null, 2);      
    } else if (name === "qos1Queue") {
      return JSON.stringify(this._client._orderedTopicsQueue._queues, null, 2);      
    } else if (name === "connectTimestamp") {
      return (new Date(this._client.connectTimestamp)).toLocaleString();
    } else if (name === "lastActiveTimestamp") {
      return (new Date(this._client.lastActiveTimestamp)).toLocaleString();
    } else if (name === "connectTimestamp") {
      return (new Date(this._client.connectTimestamp)).toLocaleString();            
    } else {
      return String(this._client[name as keyof IClient]);
    }
  }

}
