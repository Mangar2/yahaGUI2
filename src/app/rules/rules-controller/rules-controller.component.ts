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
  ruleTree: ruleTree_t | null = null;
  ruleChunks: string[] = [];
  chunkList: string[] | null = null;
  showForm: boolean = false;

  constructor(private rulesService: RulesService) {
  }

  ngOnInit() {
    this.rulesService.readRules().subscribe((res: HttpResponse<ruleTree_t>) => {
      if (res.status === 200 && res.body) {
        this.ruleTree = res.body;
        this.rules = this.rulesService.treeToList(this.ruleTree);
        this.chunkList = this.rulesService.getRuleChunkList(this.ruleTree, this.ruleChunks);
      }
    })
  }

  onRule(rule: rule_t) {
    this.rule = rule;
    this.showForm = true;
  }

  /**
   * Checks, if the current ruleChunks show rules
   */
  private isRule(ruleChunks: string[]) {
    return (ruleChunks.length > 1 && ruleChunks.at(-2) === 'rules');
  }

  private updateRuleList(ruleTree: ruleTree_t) {
    let list = this.rulesService.getRuleChunkList(ruleTree, this.ruleChunks);
    if (list[0] === 'rules') {
      this.ruleChunks.push('rules');
      list = this.rulesService.getRuleChunkList(ruleTree, this.ruleChunks);
    }
    if (list && list[0] !== 'rules') {
      if (this.ruleChunks.length > 0) {
        this.chunkList = ['<', ...list];
      } else {
        this.chunkList = [...list];
      }
    }
  }

  /**
   * Navigates in the rule-tree
   * @param chunk selected navigation item
   */
  onChunkSelected(chunk: string) {
    if (!this.ruleTree) {
      return;
    }
    
    if (chunk === '<') {
      this.ruleChunks.pop();
      if (this.ruleChunks.at(-1) === 'rules') {
        // remove 'rules' and the selection before
        this.ruleChunks.pop();
        this.ruleChunks.pop();
        this.showForm = false;
      }
    } else if (this.chunkList && this.chunkList.includes(chunk)) {
      if (this.isRule(this.ruleChunks)) {
        this.ruleChunks.pop();
      }
      this.ruleChunks.push(chunk);
    }
    if (this.isRule(this.ruleChunks)) {
      this.rule = this.rulesService.getRule(this.ruleTree, this.ruleChunks)
      this.showForm = true;
    } else {
      this.updateRuleList(this.ruleTree);
    }
    
  }
}
