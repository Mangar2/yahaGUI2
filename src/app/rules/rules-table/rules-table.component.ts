import { Component, EventEmitter, Input, Output } from '@angular/core';
import { rules_t, rule_t } from 'src/app/api/rules.service';

@Component({
  selector: 'app-rules-table',
  templateUrl: './rules-table.component.html',
  styleUrls: ['./rules-table.component.less']
})
export class RulesTableComponent {
  @Input() rules: rules_t | null = null;
  @Output()  ruleSelected = new EventEmitter<rule_t>();

  displayedColumns = ['name'];

  rowSelected(row: rule_t) {
    this.ruleSelected.emit(row);
  }
}
