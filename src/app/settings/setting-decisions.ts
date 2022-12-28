export class SettingDecisions {

  /**
   * Checks, if a topic is a switch
   * @param topicType type of the topic
   * @param topicValue value of the topic
   * @returns true, if the topic is a swith
   */
  static isSwitch(topicType: string, topicValue: string | number | null): boolean {
    let result = false;
    if (topicType === 'Switch') {
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
  static decideType(topicType: string, topicValue: string | number | null): string {
    let result = topicType === '' ? 'Information' : topicType;
    if (topicType === 'Automatic') {
      if (this.isSwitch(topicType, topicValue)) {
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
    return lowercaseValue === 'on' || lowercaseValue === '1' || lowercaseValue === 'true';
  }
}
