import { Component, Input } from '@angular/core';
import { rule_t } from 'src/app/api/rules.service';

@Component({
  selector: 'app-rule-form',
  templateUrl: './rule-form.component.html',
  styleUrls: ['./rule-form.component.less']
})
export class RuleFormComponent {

  _rule: rule_t | null = null;

  @Input() set rule(rule: rule_t | null) {
    this._rule = rule;
    if (this._rule !== null) {
      this._rule.active = this._rule.active? this._rule.active: true;
    }
  }

  get rule() { return this._rule; }

}
