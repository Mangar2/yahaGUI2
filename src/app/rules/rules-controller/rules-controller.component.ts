import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MessagesService } from 'src/app/api/messages.service';
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
  activeChunk: string | null = null;

  constructor(private rulesService: RulesService, private messagesService: MessagesService) {
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
    const last = rule.name?.at(-1);
    this.activeChunk = last ? last : null; 
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
   * Saves any changed rules and informs the rules processor to upload a new set of rules
   */
  onUploadSelected() {
    this.messagesService.publish('$SYS/automation/update', 'on', '').subscribe((res) => {
      console.log(res);
    });
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
      if (this.isRule(this.ruleChunks)) {
        // Expra pop for rulechunks, because they are not shown in the nav-bar
        this.ruleChunks.pop();
      }
      const popped = this.ruleChunks.pop();
      if (popped === 'rules') {
        // Extra pop for rules as they are not shown in the nav-bar
        this.ruleChunks.pop();
        this.activeChunk = null;
      }
    } else if (this.chunkList && this.chunkList.includes(chunk)) {
      if (this.isRule(this.ruleChunks)) {
        this.ruleChunks.pop();
      }
      this.ruleChunks.push(chunk);
    }
    if (this.isRule(this.ruleChunks)) {
      this.rule = this.rulesService.getRule(this.ruleTree, this.ruleChunks)
      if (this.rule) {
        this.rule.name = this.ruleChunks.join('/').replace('rules/', '');
      }
      const lastChunk = this.ruleChunks.at(-1);
      this.activeChunk = lastChunk ? lastChunk : null;
    } else {
      this.updateRuleList(this.ruleTree);
    }
    
  }
}
