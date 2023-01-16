import { Component, Input } from '@angular/core';
import { rule_t } from 'src/app/api/rules.service';

@Component({
  selector: 'app-rule-form',
  templateUrl: './rule-form.component.html',
  styleUrls: ['./rule-form.component.less']
})
export class RuleFormComponent {

  _rule: rule_t | null = null;
  qosValues = [undefined, 0, 1, 2];
  stringDefaults: { [index:string]: string } = {
    delayInSeconds: "",
    duration: "",
    cooldownInSeconds: "",
    active: "true",
    doLog: "false"
  };

  @Input() set rule(rule: rule_t | null) {
    this._rule = rule;
  }

  get rule() { return this._rule; }

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
      result = value ? "true": "false"
    } else {
      result = JSON.stringify(value);
    }
    return result;
  }

}
