/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview class holding message information. Messages are the base data structure of yaha 
 * - topic a url like topic for the message
 * - value the value of the message
 * - reason an array of reason information collected from all microservices collaborating to 
 * produce the message
 */

export interface IReason {
    timestamp: string;
    message: string;
}

export type IReasons = IReason[]

/**
 * Message reported
 * @attrib time timestap, when the message was sent first
 * @attrib topic topic (name) of the message
 * @attrib value value of the message
 * @attrib reason array of reason information why the message was produced and what happend with the message
 */
 export interface IMessage {
    time?: string;
    topic: string;
    value: string | number;
    reason?: IReasons;
}

/**
 * List of messages
 */
export type IMessages = IMessage[]

/**
 * Historic information of a message, the topic is the same as the topic of the message
 */
 export interface IHistory {
    time?: string;
    value?: string;
    reason?: IReasons
}

export type IHistoryList = IHistory[];
