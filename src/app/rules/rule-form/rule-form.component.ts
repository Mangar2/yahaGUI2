import { Component, EventEmitter, Input, Output } from '@angular/core';
import { rule_t } from 'src/app/api/rules.service';
import { ErrorList, Parser } from './parser';
import { stringify } from './stringify';

type fieldInfo_t = {  name: keyof rule_t, label: string, class: string }

@Component({
  selector: 'app-rule-form',
  templateUrl: './rule-form.component.html',
  styleUrls: ['./rule-form.component.less']
})
export class RuleFormComponent {

  @Output() ruleAction = new EventEmitter<{ command: string, rule: rule_t }>();

  _rule: { [index: string]: any } = {};
  _errors: { [index: string]: ErrorList } = {};
  hasErrors: boolean = false;
  qosValues = [0, 1, 2];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  navButtons = [
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

  /**
   * Default value of a rule member if the member is undefined
   * Members having this value are removed from the result
   */
  defaultValues: { [index: string]: any } = {
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
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
      this._rule =this.ruleToDisplayObject(rule);
      this.showFields = []; 
      for (let field of this.inputFields) {
        if (this._rule[field.name] !== "") {
          this.showFields.push(field);
        }
      }
    }
  }

  /**
   * Converts a rule in an object of displayable fields
   * @param rule rule to convert
   * @returns object having strings or numbers for any displayable field
   */
  private ruleToDisplayObject(rule: rule_t) {
    return { 
      name: rule.name,
      active: rule.active === undefined || rule.active === true ? 1 : 0,
      doLog: rule.doLog === undefined || rule.doLog === false ? 0 : 1,
      time: stringify(rule.time),
      weekDays: rule.weekDay || this.defaultValues['weekDays'],
      duration: rule.duration || this.defaultValues['duration'],
      cooldownInSeconds: rule.cooldownInSeconds || this.defaultValues['cooldownInSeconds'],
      delayInSeconds: rule.delayInSeconds || this.defaultValues['delayInSeconds'],
      durationWithoutMovementInMinutes: rule.durationWithoutMovementInMinutes || this.defaultValues['durationWithoutMovementInMinutes'],
      qos: String(rule.qos || 0),
      allOf: stringify(rule.allOf),
      allow: stringify(rule.allow),
      anyOf: stringify(rule.anyOf),
      check: stringify(rule.check),
      noneOf: stringify(rule.noneOf),
      topic: stringify(rule.topic),
      value: stringify(rule.value)
    };
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
      weekDay: this._rule['weekDay'],
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
   * Checks a rule member for errors
   * @param memberName name of the rule index
   */
  onChange(memberName: string) {
    if (this._rule[memberName] === undefined) {
      return;
    }
    const content = this._rule[memberName];
    const parsed = this.parse(content);
    this._errors[memberName] = parsed.error;
    this.hasErrors = false;
    for (const index in this._errors) {
      if (this._errors[index].hasErrors()) {
        this.hasErrors = true;
        break;
      }
    }
  }

  /**
   * Reacts on a click of a header button and executes the command
   * @param name of the clicked command
   */
  onClick(name: string) {
    console.log(name);
    if (!this.hasErrors) {
      const rule = this.formToRule();
      this.ruleAction.emit({ command: name, rule })
    }
  }

  /**
   * Checks, if a field has invalid content
   * @param name name of the field
   * @returns true, if the field has invalid content
   */
  isInvalidField(name: string): boolean {
    return this._errors[name] ? this._errors[name].hasErrors() : false;
  }

  /**
   * Gets an error message for a field with invalid content
   * @param name name of the field to check
   * @returns Error message for the field
   */
  getErrorMessage(name: string): string {
    const errors = this._errors[name];    
    let result = "";

    if (errors !== undefined && errors.hasErrors()) {
      const err = errors.errors[0];
      result =  `Error ${err.description} ${err.line}:${err.pos}`;
    }
    return result;
  }

}
