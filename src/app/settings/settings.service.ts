/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Service providing node specific settings witht the ability to store it
 * ToDo: provide a central storage option
 */

import { Injectable } from '@angular/core';

/**
 * Interface to hold settings information on a node element
 */
export interface INavSettings {
  disable(name: string): void;
  enable(name: string): void;
  setEnabled(name: string, value: boolean): void;
  isEnabled(name: string): boolean;
  allEnabled(): boolean;
  countDisabled(): number;

  setTopicType(type: string): void;
  getTopicType(): string;

  setValueType(type: string): void;
  getValueType(): string;

  setEnumList(list: string[]): void;
  getEnumList():string[];

  setTopicRank(type: string): void;
  getTopicRank(): number;

  setIconName(iconName: string): void;
  getIconName(): string;

  setHistoryType(type: string): void;
  getHistoryType(): string;

  setChartType(type: string): void;
  getChartType(): string;

  copy(): INavSettings;

}

type parameter_t = { [index: string]: string}
type nodeConfig_t = { disabled?: string[], parameter?: parameter_t }

/**
 * Checks, if an object is empty
 * @param obj object to check
 * @returns true, if the object has no own properties
 */
function isEmpty(obj: any): boolean {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

/**
 * Class holding setting information on a node element
 */
class NavSettings implements INavSettings {
  disabled: string[];
  parameter: parameter_t;

  constructor(disabled: string[] = [], parameter: parameter_t = {}) {
    this.disabled = disabled;
    this.parameter = parameter;
  }

  /**
   * Sets an item to be disabled
   * @param name of the item to disable
   */
  disable(name: string): void {
    if (!this.disabled.includes(name)) {
      this.disabled.push(name);
    }
  };
  /**
   * Sets an item to be enabled
   * @param name of the item to enable
   */
  enable(name: string): void {
    const index = this.disabled.indexOf(name);
    if (index > -1) {
      this.disabled.splice(index, 1);
    }
  }

  /**
   * Enable/disable an element
   * @param name of the item to enable/disable
   * @param value true, item is enabled, false: item is disabled
   */
  setEnabled(name: string, value: boolean): void {
    value ? this.enable(name) : this.disable(name)
  }

  /**
   * Check, if an item is enabled
   * @param name of the item to check
   * @returns true, if the item is enabled
   */
  isEnabled(name: string): boolean {
    // Disable all topics ending with "set" as they are set requests and not status information
    return !this.disabled.includes(name) && name !== 'set';
  }

  /**
   * Checks, if all elements are enabled
   * @returns true, if all elements are enabled
   */
  allEnabled(): boolean {
    return this.disabled.length === 0;
  };

  /**
   * Counts the number of disabled elements
   * @returns number of disabled elements
   */
  countDisabled(): number {
    return this.disabled.length;
  }

  /**
   * Sets a parameter
   * @param name name of the parameter
   * @param value value of the parameter
   */
  private setParameter(name:string, value:string | null): void {
    if (name) {
      if (value) {
        this.parameter[name] = value;
      } else {
        delete this.parameter[name];
      }
    }
  }

  /**
   * Gets the value of a parameter
   * @param name name of the parameter
   * @returns value of the parameter or null, if it does not exist
   */
  private getParameter(name: string): string | null {
    let result = null;
    if (name) {
      result = this.parameter[name];
      if (result === undefined) {
        result = null;
      }
    }
    return result;    
  }
  
  setTopicType(type: string): void {
    this.setParameter("topicType", type === 'Automatic' ? null : type);
  };
  getTopicType(): string {
    const result = this.getParameter("topicType");
    return result? result : 'Automatic';
  }

  setValueType(type: string): void {
    this.setParameter("valueType", type === 'Automatic' ? null : type);
  };
  getValueType(): string {
    const result = this.getParameter("valueType");
    return result? result : 'Automatic';
  }

  setEnumList(list: string[]): void {
    this.setParameter("enumList", list.length === 0 ? null: JSON.stringify(list))
  }
  getEnumList():string[] {
    const result = this.getParameter("enumList");
    return result ? JSON.parse(result) : [];
  }

  setTopicRank(rank: string): void {
    this.setParameter("topicRank", rank === 'Automatic' ? null : rank);
  };
  getTopicRank(): number {
    const curValue: string | number | null = this.getParameter("topicRank");
    const result: number = (curValue === null || curValue === 'Automatic') ? 6 : Number(curValue);
    return result;
  }

  setIconName(iconName: string): void {
    this.setParameter("icon", iconName === 'Automatic' ? null : iconName);
  };
  getIconName(): string {
    const result = this.getParameter("icon");
    return result? result : 'Automatic';
  }

  setHistoryType(history: string): void {
    this.setParameter("history", history === 'Automatic' ? null : history);
  };
  getHistoryType(): string {
    const result = this.getParameter("history");
    return result? result : 'Automatic';
  }

  setChartType(chartType: string): void {
    this.setParameter("chart", chartType === 'Automatic' ? null : chartType);
  };
  getChartType(): string {
    const result = this.getParameter("chart");
    return result? result : 'Automatic';
  }
  
  copy(): INavSettings {
    return new NavSettings(this.disabled, this.parameter);
  }

}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  navSettingsStore: { [index: string]: NavSettings } = {}
  storeName = "yaha_configuration";

  constructor() {
    this.getFromLocalStore();
   }

  /**
   * Creates a topic string from topic chunks
   * @param topicChunks list of topic - chunks
   * @returns topic string
   */
  private getTopic(topicChunks: string[]): string {
    return topicChunks.join('/');
  }

  /**
   * Sets node-navigation settings to the setting store
   * @param topicChunks node address 
   * @param settings settings
   */
  private setNavSettings(topic: string, settings: NavSettings) {
    this.navSettingsStore[topic] = settings;
  }

  /**
   * Gets the navigation settings for a node address
   * @param topicChunks node address
   * @returns navigation settings for this node address
   */
  public getNavSettings(topicChunks: string[]): INavSettings {
    const topic = this.getTopic(topicChunks);
    if (!this.navSettingsStore[topic]) {
      this.navSettingsStore[topic] = new NavSettings();
    }
    const settings = this.navSettingsStore[topic];
    return settings;
  }

  /**
   * Gets the navigation settings from the local store
   */
  private getFromLocalStore() {
    const storedData = localStorage.getItem(this.storeName)
    if (storedData) {
      try {
        const dataObj = JSON.parse(storedData);
        for (const key in dataObj) {
          const value = dataObj[key];
          const navSettings = new NavSettings(value.disabled, value.parameter);
          this.setNavSettings(key, navSettings);
        }
      }
      catch (err) {
        console.error(err);
      }
    }
  }

  

  /**
   * Writes navigation settings to the local store
   */
  public writeToLocalStore() {
    if (this.navSettingsStore) {
      const dataToStore: { [index:string]: nodeConfig_t} = {}
      for (const topic in this.navSettingsStore) {
        const value: NavSettings = this.navSettingsStore[topic];
        const nodeConfig: nodeConfig_t = {}
        if (!value.allEnabled()) {
          nodeConfig.disabled = value.disabled;
        }
        if (!isEmpty(value.parameter)) {
          nodeConfig.parameter = value.parameter;
        }
        if (!isEmpty(nodeConfig)) {
          dataToStore[topic] = nodeConfig;
        }
      }
      localStorage.setItem(this.storeName, JSON.stringify(dataToStore));
    }
  }

  /**
   * Checks, if a topic is a descendant, but not a direct descendant (child).
   * Childs are already show, thus they will be scipped in the additional topics list.
   * @param topic topic to check
   * @param descendantTopic descendant topic to check
   * @returns true, if descendantTopic is a descendant of topic, but not a direct descendant
   */
  private isDescendantButNotChild(topic: string, descendantTopic: string): boolean {
    let result = descendantTopic.startsWith(topic);
    if (result) {
      const topicLen = topic === '' ? 0 : topic.split('/').length
      const isChild = topicLen + 1 == descendantTopic.split('/').length;
      result = result && !isChild;
    }
    return result;
  }

  /**
   * Gets the additional topics to show in a level
   * @param topic current topic
   * @param level current level
   * @returns array of topics to show
   */
  public getAdditionalTopics(topic: string, level: number): string[] {
    const result: string[] = [];
    for (const curTopic in this.navSettingsStore) {
      const navSetting: INavSettings = this.navSettingsStore[curTopic];
      if (this.isDescendantButNotChild(topic, curTopic) && navSetting.getTopicRank() <= level) {
        result.push(curTopic);
      }
    }
    return result;
  }

}
