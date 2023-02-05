import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MessagesService } from 'src/app/api/messages.service';
import { RulePath, RulesService, rules_t, ruleTree_t, rule_t } from 'src/app/api/rules.service';

@Component({
  selector: 'app-rules-controller',
  templateUrl: './rules-controller.component.html',
  styleUrls: ['./rules-controller.component.less']
})
export class RulesControllerComponent {
  rule: rule_t | null = null;
  rulePath: RulePath = new RulePath();
  navList: string[] | null = null;
  activeChunk: string | null = null;

  constructor(private rulesService: RulesService, private messagesService: MessagesService) {
  }

  ngOnInit() {
    this.rulesService.readRules().subscribe((res: HttpResponse<ruleTree_t>) => {
      if (res.status === 200 && res.body) {
        this.rulesService.setRules(res.body);
        this.navList = this.rulesService.getNameList(this.rulePath);
      }
    })
  }

  /**
   * Updates the view  and the ruleTree based on a changed rule
   * @param rule changed rule causing the update
   * @param rulePath path to the rule update
   */
  private updateRule(rulePath: RulePath, rule: rule_t) {
    if (rule.name !== undefined) {
      this.rulesService.updateTreeNode(rulePath, rule);
      let nameChunks = rule.name.split('/');
      const name = nameChunks.at(-1);
      if (name !== undefined) {
        this.updateNavList();
        this.onChunkSelected(name);
      }
    }
  }

  /**
   * Delete a rule
   * @param rulePath path to the rule to delete
   */
  private deleteRule(rulePath: RulePath) {
    this.rulesService.deleteRule(rulePath);
    this.updateNavList();
    this.onChunkSelected(null);
  }

  /**
   * Sends a save message to the mqtt server with the rule as value
   * @param rule rule to save 
   * @param topic topic to use for sending a save message
   */
  private publishRule(rule: rule_t, topic: string) {
      const value = JSON.stringify(rule);
      this.messagesService.publish(topic, value).subscribe((res) => {
        console.log(res);
      });
  }

  /**
   * Performs an action for a rule, supported actions are "save", "delete", "reload"
   * @param action action to perform
   */
  onRuleAction(action: { command: string, rule: rule_t }) {

    const topic = `$SYS/automation/${this.rulePath.toTopic()}`;
    if (action.command === "copy" && action.rule.name) {
      action.rule.name += '-copy';
      const newName: string = action.rule.name.split('/').at(-1) || "";
      this.rulePath.name = newName;
      this.updateRule(this.rulePath, action.rule);
    } else if (action.command === "save" && action.rule.name) {
      this.updateRule(this.rulePath, action.rule);
      this.publishRule(action.rule, topic);
    } else if (action.command === "delete") {
      this.deleteRule(this.rulePath);
      this.messagesService.publish(topic, 'deleted').subscribe((res) => {
        console.log(res);
      });
    } else if (action.command === "reload") {
      this.messagesService.publish('$SYS/automation/update', 'on', '').subscribe((res) => {
        console.log(res);
      });
    }
  }


  /**
   * Updates the list of entries to be shown in the nav
   */
  private updateNavList() {
    const list = [...this.rulesService.getNameList(this.rulePath)];

    if (!this.rulePath.isEmpty()) {
      list.unshift('<');
    }
    if (this.rulesService.isRuleNode(this.rulePath)) {
      list.push('add rule');
    }
    this.navList = list;
  }

  /**
   * opens a new empty rule
   */
  newRule() {
    this.rulePath.name = 'new';
    const newRule = {
      name: this.rulePath.toTopic(),
      topic: ""
    }
    this.updateRule(this.rulePath, newRule);
    this.rule = newRule;
  }

  /**
   * Navigates in the rule-tree
   * @param chunk selected navigation item
   */
  onChunkSelected(chunk: string | null) {
    if (chunk === null) {
      this.rulePath.name = null;
      this.activeChunk = null;
    } else if (chunk === '<') {
      this.rulePath.pop();
      this.activeChunk = null;
    } else if (this.navList && this.navList.includes(chunk)) {
      this.rulePath = this.rulesService.getPath(this.rulePath, chunk);
    }
    if (this.rulePath.name !== null) {
      this.rule = this.rulesService.getRule(this.rulePath)
      if (this.rule) {
        this.rule.name = this.rulePath.toTopic();
      }
      this.activeChunk = this.rulePath.name;
    } else {
      this.updateNavList();
    }

  }
}
