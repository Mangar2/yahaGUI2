/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview class holding topic related data
 * - the last message of the topic
 * - the topic history
 */

import { IReason, IHistory } from './message'

export interface ITopicData {
    topic?: string
    value?: string
    time?: string
    reason?: IReason[]
    history?: IHistory[]
}

export type ITopicList = ITopicData[];
