import { Component, EventEmitter, Input, Output } from '@angular/core';
import { rule_t } from 'src/app/api/rules.service';
import { ErrorList, Parser } from './parser';

type fieldInfo_t = {  name: keyof rule_t, label: string, class: string }

@Component({
  selector: 'app-rule-form',
  templateUrl: './rule-form.component.html',
  styleUrls: ['./rule-form.component.less']
})
export class RuleFormComponent {

  @Output() ruleAction = new EventEmitter<{ command: string, rule: rule_t }>();

  _rule: { [index: string]: string | undefined | number } = {};
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

  defaultValues: { [index: string]: boolean | string | number } = {
    active: true,
    doLog: false,
    cooldownInSeconds: 0,
    delayInSeconds: 0,
    duration: "",
    durationWithoutMovementInMinutes: 0,
    qos: 0,
    allow: "",
    check: "",
    allOf: "",
    anyOf: "",
    noneOf: "",
    time: "",
    value: ""
  }

  inputFields: fieldInfo_t[] = [
    { name: 'allOf', label: 'All Of', class: 'rule-textarea' },
    { name: 'anyOf', label: 'Any Of', class: 'rule-textarea' },
    { name: 'allow', label: 'Allow', class: 'rule-textarea' },
    { name: 'noneOf', label: 'None Of', class: 'rule-textarea' },
    { name: 'check', label: 'Check', class: 'rule-textarea' },
    { name: 'value', label: 'Value', class: 'rule-textarea' },
    { name: 'topic', label: 'Topic', class: 'rule-textarea' }
  ]

  showFields: fieldInfo_t[] = []

  @Input() set rule(rule: rule_t | null) {
    if (rule !== null) {
      this._rule = { 
        name: rule.name,
        active: rule.active === undefined || rule.active === true ? 1 : 0,
        doLog: rule.doLog === undefined || rule.doLog === false ? 0 : 1,
        time: this.stringify(rule.time),
        duration: String(rule.duration || ""),
        cooldownInSeconds: String(rule.cooldownInSeconds || ""),
        delayInSeconds: String(rule.delayInSeconds || ""),
        durationWithoutMovementInMinutes: String(rule.durationWithoutMovementInMinutes || ""),
        qos: String(rule.qos || 0),
        allOf: this.stringify(rule.allOf),
        allow: this.stringify(rule.allow),
        anyOf: this.stringify(rule.anyOf),
        check: this.stringify(rule.check),
        noneOf: this.stringify(rule.noneOf),
        topic: this.stringify(rule.topic),
        value: this.stringify(rule.value)
      };
      this.showFields = [];
      for (let field of this.inputFields) {
        if (this._rule[field.name] !== "") {
          this.showFields.push(field);
        }
      }
    }
  }

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
   * Calculates the number of rows in a textarea
   * @param content content to show in a textarea
   * @returns number of rows for the textarea
   */
  getRows(index: string): number {
    const content = this._rule[index];
    let result: number = 0;
    if (typeof(content) === 'string') {
      result = content.split('\n').length + 1;
    }
    return result > 20 ? 20 : result;
  }


  /**
   * Converts an input from string to any object
   * @param content field content to parse
   * @returns parsed object
   */
  private parse(content: any): { parsed: any, error: ErrorList } {
    if (typeof(content) !== 'string' || content === "") {
      return { parsed: content, error: new ErrorList() };
    }
    const parser = new Parser(content);
    return parser.parse();
  }

  /**
   * Creates a rule from the current form content.
   * @returns rule in rule_t format
   */
  formToRule(): rule_t {
    const saveRule: rule_t = { 
      name: this.rule?.name,
      active: this._rule["active"] ? true : false,
      doLog: this._rule["doLog"] ? true : false,
      time: this.parse(this._rule['time']).parsed,
      duration: this._rule["duration"],
      cooldownInSeconds: Number(this._rule["cooldownInSeconds"]),
      delayInSeconds: Number(this._rule["delayInSeconds"]),
      durationWithoutMovementInMinutes: Number(this._rule["durationWithoutMovementInMinutes"]),
      qos: Number(this._rule["qos"]),
      allOf: this.parse(this._rule['allOf']).parsed,
      allow: this.parse(this._rule['allow']).parsed,
      anyOf: this.parse(this._rule['anyOf']).parsed,
      check: this.parse(this._rule['check']).parsed,
      noneOf: this.parse(this._rule['noneOf']).parsed,
      topic: this.parse(this._rule['topic']).parsed,
      value: this.parse(this._rule['value']).parsed
    }
    let index: keyof rule_t;
    for (index in saveRule) {
      if (saveRule[index] == this.defaultValues[index]) {
        delete saveRule[index];
      }
    }
    return saveRule;
  }

  /**
   * Reacts on a click of a header button and executes the command
   * @param name of the clicked command
   */
  onClick(name: string) {
    console.log(name);
    const rule = this.formToRule();
    this.ruleAction.emit({ command: name, rule })
  }

  /**
   * Checks, if a field has invalid content
   * @param name name of the field
   * @returns true, if the field has invalid content
   */
  isInvalidField(name: string): boolean {
    if (this._rule[name] === undefined) {
      return false;
    }
    const parsed = this.parse(this._rule[name]);
    const hasErrors = parsed.error.hasErrors();
    return hasErrors;
  }

  /**
   * Gets an error message for a field with invalid content
   * @param name name of the field to check
   * @returns Error message for the field
   */
  getErrorMessage(name: string): string {
    if (this._rule[name] === undefined) {
      return "";
    }
    const parsed = this.parse(this._rule[name]);
    let result = "";
    if (parsed.error.hasErrors()) {
      const err = parsed.error.errors[0];
      result =  `Error ${err.description} ${err.line}:${err.pos}`;
    }
    return result;
  }

}
