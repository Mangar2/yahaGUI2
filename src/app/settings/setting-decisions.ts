/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Brief Service deciding about types and status of a topic and its value
 */

import { INavSettings } from "./settings.service";

export class SettingDecisions {

  static typeIdentifier: { [index:string]:string} = {
    "window": "Window",
    "temperature": "Temperature",
    "humidity": "Humidity",
    "roller shutter": "Roller",
    "pressure": "Air Pressure",
    "light on time": "Light"
  }

  static switchingTypes: string[] = [
    "Roller", "Camera", "Light", "Switch"
  ]

  static unitIdentifier: { [index:string]:string } = {
    "Temperature": "°C",
    "Humidity": "%rH",
    "Air Pressure": "hPa"
  }

  static icons: { [index:string]:string | string[] } = {
    "Camera": "camera_indoor_FILL0_wght400_GRAD0_opsz48.png",
    "Charge": "charger_FILL0_wght400_GRAD0_opsz48.png",
    "Humidity": "humidity_percentage_FILL0_wght400_GRAD0_opsz48.png",
    "Light": "lightbulb_FILL0_wght400_GRAD0_opsz48.png",
    "Pressure": "air_pressure.png",
    "Temperature": "device_thermostat_FILL0_wght400_GRAD0_opsz48.png",
    "TV": "tv_gen_FILL0_wght400_GRAD0_opsz48.png",
    "Ventilation": "ventilation.png",
    "Window": "window.png",
    "Roller": ["roller_closed.png", "roller_open.png"],
    "Multimedia": "multimedia.png",
    "Presence": "home_pin_FILL0_wght400_GRAD0_opsz48.png",
  }

  /**
   * Derives the type from the topic
   * @param topicChunk last chunk of the topic
   * @returns decided type, if the topic chunk contains a specific type
   */
  private static typeByTopic(topicChunk: string | null | undefined): string | null {
    if (!topicChunk) {
      return null;
    }
    let result: string | null = null;
    for (let name in this.typeIdentifier) {
      if (topicChunk.includes(name)) {
        result = this.typeIdentifier[name];
        break;
      }
    }
    return result;
  }

  /**
   * Checks, if a topic is a switch
   * @param topicType type of the topic
   * @param topicValue value of the topic
   * @returns true, if the topic is a swith
   */
  static isSwitch(topicValue: string | number | null, topicType: string): boolean {
    let result = false;
    if (this.switchingTypes.includes(topicType)) {
      result = true;
    } else if (topicType === 'Automatic' && topicValue) {
      const lowercaseValue = String(topicValue).toLowerCase();
      result = lowercaseValue === 'on' || lowercaseValue === 'off';
    }
    return result;
  }

  /**
   * Decides the topc type - replacing "Automatic" by a decision
   * @param topicType configured topic type
   * @param topicValue current value
   * @returns the topic but "Automatic" is replaced by a concrete type based on the current value
   */
  static decideType(topicType: string, topicChunk: string | undefined | null, topicValue: string | number | null): string {
    let result = topicType === '' ? 'Information' : topicType;
    if (topicType === 'Automatic') {
      const typeByTopic = this.typeByTopic(topicChunk);
      if (typeByTopic !== null) {
        result = typeByTopic;
      } else if (this.isSwitch(topicValue, topicType)) {
        result = 'Switch'
      } else {
        result = 'Information'
      }
    }
    return result;
  }

  /**
   * Decides the value type - replacing "Automatic" by a decision
   * @param valueType configured value type
   * @param topicValue current value
   * @returns the valueType but "Automatic" is replaced by a concrete type
   */
  static decideValueType(valueType: string, topicValue: string | number | null): string {
    let result = valueType === '' ? 'String' : valueType;
    if (valueType === 'Automatic') {
      result = 'String';
    }
    return result;
  }

  /**
   * Checks, if a switch is on
   * @param topic topic to identify the switch
   * @returns true, if the switch is on
   */
  static isSwitchOn(value: string | number | null, topicType: string, valueType: string, enumList: string[]): boolean {
    if (!value) {
      return false;
    }
    let result: boolean = false;
    const lowercaseValue = String(value).toLowerCase();
    switch (topicType) {
      case 'Switch': result = lowercaseValue !== 'off' && lowercaseValue !== '0' && lowercaseValue !== 'false'; break;
      case 'Roller': result = lowercaseValue !== 'down' && lowercaseValue !== '0'; break;
      case 'Parameter': {
        result = true;
        // We need to store all "off" values in the enumList, but only one "on" value - the first one.
        // There might be "on" values not found in the list, not finding the value is concidered as "on"
        // So we do not need to identify values as "on" and as "off" values while entering the data.
        for (let index = 1; index < enumList.length; index++) {
          if (lowercaseValue === enumList[index]) {
            result = false;
            break;
          }
        }
        break;
      }
    }
    return result;
  }

  /**
   * Gets the unit for a topic type
   * @param topicType type of the current topic
   * @returns unit for the type
   */
  static getUnit(topicType: string) : string {
    const unit = this.unitIdentifier[topicType];
    return unit ? unit : "";
  }

  /**
   * Gets the icon-picture for a topic type
   * @param topic current topic used to select the picture
   * @param topicType type of the current topic
   * @returns name of the picture
   */
  static getIcon(iconName: string, topic: string, topicValue: string) : string | null {
    let pictures = this.icons[iconName] ? this.icons[iconName] : null;
    if (!pictures) {
      for (const pictureName in this.icons) {
        if (topic.includes(pictureName.toLowerCase())) {
          pictures = this.icons[pictureName];
          break;
        }
      }
    }
    let result = Array.isArray(pictures) ? pictures[0] : pictures;
    if (Array.isArray(pictures)) {
      const showOnIcon = topicValue !== 'off' && topicValue !== 'down' && topicValue !== '0' && topicValue !== 'closed';
      if (pictures[1] && showOnIcon) {
        result = pictures[1];
      }
    }
    return result;
  }

  /**
   * Evaluates the new value after switching
   * @param topicType type of the topic
   * @param topicValue current value of the topic
   * @param valueType type of the value
   * @returns the new value
   */
  static newSwitchValue(checked: boolean, topicType: string, valueType: string, enumeration: string[]): string {
    let result: string = "";
    switch (topicType) {
      case 'Roller': result = checked ? 'up': 'down'; break;
      case 'Switch': result = checked ? 'on' : 'off'; break;
      case 'Parameter': 
        if (Array.isArray(enumeration) && enumeration.length > 1) {
          const pos = checked ? 0 : 1;
          result = enumeration[pos];
        };
        break;
    }
    console.log(result);
    return result;
  }

}
