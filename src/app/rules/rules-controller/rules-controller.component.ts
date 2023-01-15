import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RulesService, rules_t, ruleTree_t, rule_t } from 'src/app/api/rules.service';

@Component({
  selector: 'app-rules-controller',
  templateUrl: './rules-controller.component.html',
  styleUrls: ['./rules-controller.component.less']
})
export class RulesControllerComponent {
  rules: rules_t | null = null;
  rule: rule_t | null = null;
  showForm: boolean = false;

  constructor(private rulesService: RulesService) {
  }

  ngOnInit() {
    this.rulesService.readRules().subscribe((res: HttpResponse<ruleTree_t>) => {
      if (res.status === 200 && res.body) {
        const ruleTree: ruleTree_t = res.body;
        this.rules = this.rulesService.treeToList(ruleTree)
      }
    })
  }

  onRule(rule: rule_t) {
    this.rule = rule;
    this.showForm = true;
  }
}
