import { Component, ContentChild, Input } from '@angular/core';
import { rule_t } from 'src/app/api/rules.service';

@Component({
  selector: 'app-rule-form',
  templateUrl: './rule-form.component.html',
  styleUrls: ['./rule-form.component.less']
})
export class RuleFormComponent {

  _rule: rule_t | null = null;
  qosValues = [0, 1, 2];
  navButtons = [
    {
      img: "rule_FILL0_wght400_GRAD0_opsz48.png",
      text: "test"
    },
    {
      img: "save_FILL0_wght400_GRAD0_opsz48.png",
      text: "save"
    },
    {
      img: "delete_FILL0_wght400_GRAD0_opsz48.png",
      text: "delete"
    },
    {
      img: "upgrade_FILL0_wght400_GRAD0_opsz48.png",
      text: "reload"
    }
  ]

  duration: string = "";

  stringDefaults: { [index: string]: string } = {
    delayInSeconds: "",
    duration: "",
    cooldownInSeconds: "",
    active: "true",
    doLog: "false"
  };

  defaultValues: { [index:string]: boolean | string | number } = {
    active: true,
    doLog: false,
    qos: 0
  }

    @Input() set rule(rule: rule_t | null) {
    this._rule = rule;
    if (this.rule === null) {
      return;
    }
    this.rule.active = this.rule.active || true;
    this.rule.qos = this.rule.qos || 0;
    this.rule.allOf = this.stringify(this.rule.allOf);
    this.rule.allow = this.stringify(this.rule.allow);
    this.rule.anyOf = this.stringify(this.rule.anyOf);
    this.rule.check = this.stringify(this.rule.check);
    this.rule.noneOf = this.stringify(this.rule.noneOf);
    this.rule.time = this.stringify(this.rule.time);
    this.rule.topic = this.stringify(this.rule.topic);
    this.rule.value = this.stringify(this.rule.value);
  }

  get rule() { return this._rule; }

  /**
   * Stringifies a JSON object in a convinient way to display it
   * @param object 
   */
  stringify(object: any, indent: string = ''): string {
    let result: string = "";
    const sub: string[] = [];
    if (Array.isArray(object)) {
      let totalLen = 0;
      let noObject = true;
      for (const elem of object) {
        noObject &&= !Array.isArray(elem) && typeof elem !== 'object';
        const newStr = this.stringify(elem, indent + '  ');
        totalLen += newStr.length;
        sub.push(newStr);
      }
      if (totalLen < 60 && noObject) {
        result = `[ ${sub.join(', ')} ]`;
      } else if (sub[0].length < 10) {
        result = `[ ${sub.join(',\n  ' + indent)}\n${indent}]`;
      } else {
        result = `[\n  ${indent + sub.join(',\n  ' + indent)}\n${indent}]`;
      }
    } else if (typeof object === 'object') {
      for (const index in object) {
        const elem = object[index];
        sub.push(`"${index}": ${this.stringify(elem, indent + '  ')}`)
      }
      result = `{\n  ${indent + sub.join(',\n  ' + indent)}\n${indent}}`;
    } else if (object !== undefined) {
      result = `"${object}"`;
    }
    return result;
  }

  /**
   * Gets a property of a rule to display it in an input box
   * @param index property name
   * @returns a displayable version of the property
   */
  getStringProperty(index: keyof rule_t): string {
    let result: string = "";
    if (this._rule === null) {
      return result;
    }
    const value = this._rule[index];
    if (value === undefined) {
      if (this.stringDefaults[index]) {
        result = this.stringDefaults[index];
      }
    } else if (typeof value === "number" || typeof value === "string") {
      result = String(value);
    } else if (typeof value === "boolean") {
      result = value ? "true" : "false"
    } else {
      result = this.stringify(value);
    }
    return result;
  }

  /**
   * Calculates the number of rows in a textarea
   * @param content content to show in a textarea
   * @returns number of rows for the textarea
   */
  getRows(index: keyof rule_t): number {
    const content = this.getStringProperty(index);
    let result: number = content.split('\n').length + 1;
    return result > 20 ? 20 : result;
  }

  onClick(name:string) {
    console.log(name);
    if (this.rule) {
      const saveRule = {...this.rule}
      let index: keyof rule_t;
      for (index in saveRule) {
        if (saveRule[index] == this.defaultValues[index]) {
          delete saveRule[index];
        }
      }
      console.log(this.rule.anyOf);
      saveRule.allOf = typeof this.rule.allOf === 'string' ? JSON.parse(this.rule.allOf) : this.rule.allOf;
      saveRule.allow = typeof this.rule.allow === 'string' ? JSON.parse(this.rule.allow) : this.rule.allow;
      saveRule.anyOf = typeof this.rule.anyOf === 'string' ? JSON.parse(this.rule.anyOf) : this.rule.anyOf;
      saveRule.check = typeof this.rule.check === 'string' ? JSON.parse(this.rule.check) : this.rule.check;
      saveRule.noneOf = typeof this.rule.noneOf === 'string' ? JSON.parse(this.rule.noneOf) : this.rule.noneOf;
      saveRule.time = typeof this.rule.time === 'string' ? JSON.parse(this.rule.time) : this.rule.time;
      saveRule.topic = typeof this.rule.topic === 'string' ? JSON.parse(this.rule.topic) : this.rule.topic;
      saveRule.value = typeof this.rule.value === 'string' ? JSON.parse(this.rule.value) : this.rule.value;
      console.log(saveRule);
    }
  }

}
