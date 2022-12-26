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
}

/**
 * Class holding setting information on a node element
 */
class NavSettings implements INavSettings {
  disabled: string[];

  constructor(disabled: string[] = []) {
    this.disabled = disabled;
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
   * Saves the nav settings to local store
   */
  public saveToLocalStore() {
    const data = JSON.stringify(this.navSettingsStore);
    localStorage.setItem(this.storeName, data);
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
          const navSettings = new NavSettings(value.disabled);
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
      const dataToStore: { [index:string]: { disabled: string[] }} = {}
      for (const topic in this.navSettingsStore) {
        console.log(topic);
        const value: NavSettings = this.navSettingsStore[topic];
        if (!value.allEnabled()) {
          dataToStore[topic] = { disabled: value.disabled }
        }
      }
      console.log(this.navSettingsStore);
      console.log(dataToStore);
      localStorage.setItem(this.storeName, JSON.stringify(dataToStore));
    }
  }

}
