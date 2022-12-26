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

  setTopicRank(type: string): void;
  getTopicRank(): string;

  setIconName(type: string, iconName: string): void;
  getIconName(type: string): string;

  setHistoryType(type: string): void;
  getHistoryType(): string;

  setChartType(type: string): void;
  getChartType(): string;

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
    return !this.disabled.includes(name);
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
    this.setParameter("topicType", type === 'Undefined' ? null : type);
  };
  getTopicType(): string {
    const result = this.getParameter("topicType");
    return result? result : 'Undefined';
  }

  setValueType(type: string): void {
    this.setParameter("valueType", type === 'Undefined' ? null : type);
  };
  getValueType(): string {
    const result = this.getParameter("valueType");
    return result? result : 'Undefined';
  }

  setTopicRank(rank: string): void {
    this.setParameter("topicRank", rank === 'None' ? null : rank);
  };
  getTopicRank(): string {
    const result = this.getParameter("topicRank");
    return result? result : 'None';
  }

  setIconName(type: string, iconName: string): void {
    this.setParameter("icon_" + type, type === 'None' ? null : type);
  };
  getIconName(type: string): string {
    const result = this.getParameter("icon_" + type);
    return result? result : 'None';
  }

  setHistoryType(rank: string): void {
    this.setParameter("history", rank === 'None' ? null : rank);
  };
  getHistoryType(): string {
    const result = this.getParameter("history");
    return result? result : 'None';
  }

  setChartType(rank: string): void {
    this.setParameter("chart", rank === 'None' ? null : rank);
  };
  getChartType(): string {
    const result = this.getParameter("chart");
    return result? result : 'None';
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

}
