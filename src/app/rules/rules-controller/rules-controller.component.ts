import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MessagesService } from 'src/app/api/messages.service';
import { RulePath, RulesService, rules_t, ruleTreeExternalFormat_t, ruleTree_t, rule_t } from 'src/app/api/rules.service';

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
    this.updateNavList();
    this.rulesService.readRules().subscribe((res: HttpResponse<ruleTreeExternalFormat_t>) => {
      if (res.status === 200 && res.body) {
        this.rulesService.setRulesFromExternalFormat(res.body);
        this.updateNavList();
        this.rulesService.writeRulesToLocalStore();
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
      let nameChunks = rule.name.split('/');
      const name = nameChunks.pop();
      if (name !== undefined) {
        const newPath = new RulePath(nameChunks);
        newPath.name = name;
        console.log(newPath);
        this.rulesService.updateTreeNode(newPath, rule);
        this.updateNavList();
        this.onChunkSelected(name);
        this.rulesService.writeRulesToLocalStore();
      }
    }
  }

  /**
   * Delete a rule
   * @param rulePath path to the rule to delete
   */
  private deleteRule(rulePath: RulePath) {
    this.rulePath = this.rulesService.deleteNode(rulePath);
    this.updateNavList();
    this.onChunkSelected(null);
    this.rulesService.writeRulesToLocalStore();
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

    const topic = `$SYS/automation/rules/${action.rule.name}`;
    if (action.command === "copy" && action.rule.name) {
      action.rule.name += '-copy';
      const newName: string = action.rule.name.split('/').at(-1) || "";
      this.rulePath.pop();
      this.rulePath.push(newName);
      this.updateRule(this.rulePath, action.rule);
    } else if (action.command === "save" && action.rule.name) {
      this.updateRule(this.rulePath, action.rule);
      this.publishRule(action.rule, topic);
    } else if (action.command === "delete") {
      this.deleteRule(this.rulePath);
      this.messagesService.publish(topic, 'delete').subscribe((res) => {
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
    list.push('add rule');
    this.navList = list;
  }

  /**
   * opens a new empty rule
   */
  addSelected(command: string) {
    if (command === 'rule') {
      this.rulePath.name = 'new';
      const newRule = {
        name: this.rulePath.toTopic(),
        topic: ""
      }
      this.updateRule(this.rulePath, newRule);
      this.rule = newRule;
    } else if (command === 'folder') {

    }
  }

  /**
   * Navigates in the rule-tree
   * @param chunk selected navigation item
   */
  onChunkSelected(chunk: string | null) {
    this.rulePath.name = null;
    if (chunk === null) {
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
