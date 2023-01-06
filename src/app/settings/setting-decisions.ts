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

  static icons: { [index:string]:string } = {
    "Camera": "camera_indoor_FILL0_wght400_GRAD0_opsz48.png",
    "Charge": "charger_FILL0_wght400_GRAD0_opsz48.png",
    "Humidity": "humidity_percentage_FILL0_wght400_GRAD0_opsz48.png",
    "Light": "lightbulb_FILL0_wght400_GRAD0_opsz48.png",
    "Pressure": "air_pressure.png",
    "Temperature": "device_thermostat_FILL0_wght400_GRAD0_opsz48.png",
    "TV": "tv_gen_FILL0_wght400_GRAD0_opsz48.png",
    "Ventilation": "ventilation.png",
    "Window": "window.png",
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
  static isSwitch(topicType: string, topicValue: string | number | null): boolean {
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
      } else if (this.isSwitch(topicType, topicValue)) {
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
  static isSwitchOn(value: string | number | null): boolean {
    if (!value) {
      return false;
    }
    const lowercaseValue = String(value).toLowerCase();
    return lowercaseValue !== 'off' && lowercaseValue !== '0' && lowercaseValue !== 'false';
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
  static getPicture(topic: string, topicType: string) : string | null {
    let result = null;
    for (const pictureName in this.icons) {
      if (topic.includes(pictureName.toLowerCase())) {
        result = this.icons[pictureName];
        break;
      }
    }
    return result;
  }

}
