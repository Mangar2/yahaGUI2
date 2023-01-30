import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type rule = number | string | rule[]

export type rule_t = {
  name?: string,
  doLog?: boolean,
  active?: boolean,
  durationWithoutMovementInMinutes?: number,
  allOf?: string | string[],
  anyOf?: string | string[],
  allow?: string | string[],
  noneOf?: string | string[],
  topic: string | { [index: string]: number | string },
  check?: rule,
  value?: rule,
  time?: string | rule,
  weekDay?: string | string[],
  duration?: number | string,
  cooldownInSeconds?: number,
  delayInSeconds?: number,
  qos?: number
}

export type rules_t = rule_t[];

export type ruleTree_t = {
  [index:string]: ruleTree_t | any;
}


@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor(private httpClient: HttpClient) { }

  /**
   * Stores configuration
   * @returns observable
   */
  readRules(): Observable<HttpResponse<ruleTree_t>> {
    const topic = 'automation/rules';
    return this.httpClient.get<ruleTree_t>(environment.configHost + topic, { observe: 'response' });
  }

  /**
   * Converts a rule tree to a rule list
   * @param tree tree of rules
   * @param name current name => fills recursively, leave blank!
   */
  treeToList(tree: ruleTree_t, name: string = ""): rules_t {
    const result: rules_t = []

    for (const chunk in tree) {
      const subtree: any = tree[chunk]
      if (chunk !== 'rules') {
        result.push(...this.treeToList(tree[chunk], name + '/' + chunk))
      } else {
        const ruleTree = tree['rules'];
        for (const ruleChunk in ruleTree) {
          const ruleName = name += '/' + ruleChunk;
          const rule: rule_t = { name: ruleName, ...ruleTree[ruleChunk] }
          result.push(rule)
        }
      }
    }
    return result;
  }

  /**
   * Runs through the tree to select a tree node
   * @param ruleTree tree to search recursively
   * @param ruleChunks path to the node
   * @returns node of the tree
   */
  getTreeNode(ruleTree: ruleTree_t, ruleChunks:string[] | null): ruleTree_t | any {
    let result: ruleTree_t | null = ruleTree;
    if (ruleChunks && ruleChunks.length !== 0) {
      const newChunks = [...ruleChunks];
      const ruleChunk = newChunks.shift();
      if (ruleChunk && ruleTree[ruleChunk]) {
        result = this.getTreeNode(ruleTree[ruleChunk], newChunks);
      } else {
        result = null;
      }
    }
    return result;
  }


  /**
   * Converts a rule tree to a rule list
   * @param ruleTree tree of rules
   * @param name current name => fills recursively, leave blank!
   */
  getRuleChunkList(ruleTree: ruleTree_t, ruleChunks: string[] | null): string[] {
    const treeNode: ruleTree_t | null = this.getTreeNode(ruleTree, ruleChunks);
    let result: string[] = [];
    if (treeNode) {
      for (const ruleChunk in treeNode) {
        result.push(ruleChunk);
      }
    } 
    return result;
  }

  /**
   * Gets a rule from the rule tree
   * @param ruleTree tree with rules
   * @param ruleChunks path to the rule
   * @returns the rule or null if the rule is not found
   */
  getRule(ruleTree: ruleTree_t, ruleChunks:string[] | null): rule_t | null {
    let result: rule_t | null = null;
    const treeNode: ruleTree_t | any = this.getTreeNode(ruleTree, ruleChunks);
    if (treeNode) {
      result = treeNode;
    }
    return result;
  }

}
