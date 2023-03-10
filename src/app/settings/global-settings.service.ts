/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Service storing global settings
 */

import { Injectable } from '@angular/core';
import { SettingDecisions } from './setting-decisions';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  settings = {
    detail_View_Refresh_In_Milliseconds: 2 * 1000,
    overview_Refresh_In_Milliseconds: 2 * 1000,
    vaue_Change_Poll_Amount: 15
  }

  settingOptions = {
    topicType: 'Automatic',
    topicTypes: ['Automatic', 'Information', 'Switch', 'Light', 'Roller', 'Window', 'Parameter'],
    valueType: 'Automatic',
    valueTypes: ['Automatic', 'Integer', 'Number', 'Enumeration', 'String'],
    topicRank: 'Automatic',
    topicRanks: ['Automatic', 1, 2, 3, 4, 5],
    topicIcon: 'Automatic',
    topicIcons: ['Automatic']
  }

  constructor() { 
    for (let icon in SettingDecisions.icons) {
      this.settingOptions.topicIcons.push(icon);
    }
  }

  getDetailViewRefreshInMilliseconds() {
    return this.settings.detail_View_Refresh_In_Milliseconds;
  }

  getOverviewRefreshInMilliseconds() {
    return this.settings.overview_Refresh_In_Milliseconds;
  }

  getValueChangePollAmount() {
    return this.settings.vaue_Change_Poll_Amount;
  }

  getSettingOptions() {
    return this.settingOptions;
  }

}
