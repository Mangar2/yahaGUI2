import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

export interface IClient {
  _clientId: string
  _host: string
  _port: string | number
  nextMessageId: number
  token: {
      send: string
      receive: string
  }
  keepAlive: number
  lastActiveTimestamp: number
  startToTransmitTimestamp: number
  version: string
  clean: boolean
  status: string
  connectTimestamp: number,
  subscribePattern: {
    _topicPatternList: { [index:string]: number}
  },
  _orderedTopicsQueue: {
    _queues: { [index:string]: [] }
  },
  _qos0Queue: { 
    _queue: any
  },
  qos2Queue: any

}


export type IClients = { [key: string] : IClient }

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private httpClient: HttpClient) { }

  
  /**
   * Gets information about known clients
   * @param host host name of the broker
   * @param port port name/number of the broker
   */
  public readClients (host: string = '192.168.0.4', port: string = '8183') : Observable<IClients> {
      const url = "http://" + host + ":" + port + "/clients";
      return this.httpClient.get<IClients>(url);
  }

  
}
