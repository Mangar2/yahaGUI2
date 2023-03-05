import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type rule = number | string | rule[]

export type rule_t = {
  name?: string,
  doLog?: boolean,
  active?: boolean,
  isValid?: boolean,
  durationWithoutMovementInMinutes?: number,
  allOf?: string | string[],
  anyOf?: string | string[],
  allow?: string | string[],
  noneOf?: string | string[],
  topic: string | { [index: string]: number | string },
  check?: rule,
  value?: rule,
  time?: string | rule,
  weekDays?: string | string[],
  duration?: number | string,
  cooldownInSeconds?: number,
  delayInSeconds?: number,
  qos?: number
}

export type rules_t = rule_t[];

export type ruleTree_t = {
  [index: string]: ruleTree_t | any;
}

export class RulePath {
  chunks: string[];

  constructor(chunks: string[] = []) {
    this.chunks = [...chunks];
  }

  clone = () => new RulePath(this.chunks);
  shift = () => this.chunks.shift();

  /**
   * Removes any rules element from the chunk
   * @returns chunks without "rules" chunk
   */
  private removeRule(): string[] {
    const result = [];
    for (const chunk of this.chunks) {
      if (chunk !== 'rules') {
        result.push(chunk);
      }
    }
    return result;
  }

  /**
   * A rule path has the format
   * a/b/c/rules/name
   * The name is the last chunk after "rules" is signaling a tree leaf node
   */
  get name(): string | null {
    let result = null;
    if (this.chunks.at(-2) === 'rules') {
      result = this.chunks.at(-1);
    }
    return result === undefined ? null : result;
  }

  set name(name: string | null) {
    if (this.chunks.at(-1) === 'rules' && name !== null) {
      this.chunks.push(name);
    } else if (this.chunks.at(-2) === 'rules') {
      if (name === null) {
        this.chunks.pop();
      } else {
        this.chunks[this.chunks.length - 1] = name;
      }
    } else if (name !== null) {
      this.chunks.push('rules');
      this.chunks.push(name);
    }
  }

  /**
   * @returns true, if the path has a "rules" entry
   */
  hasRules = (): boolean => this.chunks.includes('rules');

  /**
   * Last element of the path
   */
  get last(): string | null {
    const last = this.chunks.at(-1);
    return last === undefined ? null : last;
  }

  /**
   * Returns the topic for the rule
   * @returns topic matching the chunk
   */
  toTopic = () => this.removeRule().join('/');

  /**
   * @returns the path as string separated by '/'
   */
  toString = () => this.chunks.join('/');

  /**
   * Checks, if the chunk list is empty
   * @returns true, if the chunk list is empty
   */
  isEmpty = () => this.chunks.length === 0;

  /**
   * Pops the last item from the path
   */
  pop() {
    while (this.hasRules()) {
      this.chunks.pop();
    }
    this.chunks.pop();
  }

  /**
   * pushes a new item to the path
   */
  push(chunk: string) {
    if (this.chunks.at(-1) === 'rules' && chunk !== null) {
      this.chunks.push(chunk);
    } else if (this.chunks.at(-2) === 'rules') {
      if (chunk === null) {
        this.chunks.pop();
      } else {
        this.chunks[this.chunks.length - 1] = chunk;
      }
    } else {
      this.chunks.push(chunk);
    }
  }

}


@Injectable({
  providedIn: 'root'
})
export class RulesService {

  rules: ruleTree_t = {}
  constructor(private httpClient: HttpClient) { 
    this.rules = this.getRulesFromLocalStore()
  }
  storeName = "yaha_rules";


  /**
   * Stores configuration
   * @returns observable
   */
  readRules(): Observable<HttpResponse<ruleTree_t>> {
    const topic = 'automation/rules';
    return this.httpClient.get<ruleTree_t>(environment.configHost + topic, { observe: 'response' });
  }

  /**
   * Gets the rules tree from the local store
   */
  private getRulesFromLocalStore() {
    let rules = {}
    const storedData = localStorage.getItem(this.storeName)
    if (storedData) {
      try {
        rules = JSON.parse(storedData);
      }
      catch (err) {
        console.error(err);
      }
    }
    return rules
  }

  /**
   * Writes the rules tree to the local store
   */
  public writeRulesToLocalStore() {
    if (this.rules) {
      localStorage.setItem(this.storeName, JSON.stringify(this.rules));
    }
  }

  setRules(rules: ruleTree_t) {
    this.rules = rules;
  }

  /**
   * Converts a rule tree to a rule list
   * @param rules tree of rules
   * @param name current name => fills recursively, leave blank!
   */
  treeToList(rules: ruleTree_t, name: string = ""): rules_t {
    const result: rules_t = []

    for (const chunk in rules) {
      const subtree: any = rules[chunk]
      if (chunk !== 'rules') {
        result.push(...this.treeToList(rules[chunk], name + '/' + chunk))
      } else {
        const ruleTree = rules['rules'];
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
   * @param rulePath path to the node
   * @returns node of the tree
   */
  getTreeNode(ruleTree: ruleTree_t, rulePath: RulePath): ruleTree_t | any {
    let result: ruleTree_t | null = ruleTree;
    if (!rulePath.isEmpty()) {
      const newChunks = rulePath.clone();
      const ruleChunk = newChunks.shift();
      if (ruleChunk) {
        if (!ruleTree[ruleChunk]) {
          ruleTree[ruleChunk] = {}
        }
        result = this.getTreeNode(ruleTree[ruleChunk], newChunks);
      } else {
        result = null;
      }
    }
    return result;
  }

  /**
   * Checks, if a node has nodes
   * @param rulePath path to the node
   * @returns true, if the path leads to a node that may contain rules (a leaf-node)
   */
  isRuleNode(rulePath: RulePath): boolean {
    if (rulePath.hasRules()) {
      return true;
    } else {
      const node = this.getTreeNode(this.rules, rulePath);
      return node['rules'] !== undefined;
    }
  }

  /**
   * Updates a node in the tree
   * @param rulePath path to the node
   * @returns node of the tree
   */
  updateTreeNode(rulePath: RulePath, newRule: rule_t) {
    const curChunks = rulePath.clone();
    const newName = newRule.name?.split('/').at(-1);
    const curName = rulePath.name;

    if (newName !== undefined) {
      curChunks.name = null;
      const node = this.getTreeNode(this.rules, curChunks);
      node[newName] = newRule;
      if (newName !== curName && curName !== null) {
        delete node[curName];
      }
    }
  }

  /**
   * Deletes a rule
   * @param rulePath path to the rule
   */
  deleteRule(rulePath: RulePath) {
    const curChunks = rulePath.clone();
    const curName = rulePath.name;

    if (curName !== null) {
      curChunks.name = null;
      const node = this.getTreeNode(this.rules, curChunks);
      delete node[curName];
    }
  }

  /**
   * Gets the list of rule names of the current tree path
   * @param name current name => fills recursively, leave blank!
   */
  getNameList(rulePath: RulePath): string[] {
    const curPath = rulePath.clone();
    curPath.name = null;
    let treeNode: ruleTree_t | null = this.getTreeNode(this.rules, curPath);
    let result: string[] = [];
    if (treeNode !== null && treeNode['rules'] !== undefined) {
      treeNode = treeNode['rules'];
    }

    if (treeNode) {
      for (const ruleChunk in treeNode) {
        result.push(ruleChunk);
      }
    }
    return result;
  }

  /**
   * Gets a rule from the rule tree
   * @param rulePath path to the rule
   * @returns the rule or null if the rule is not found
   */
  getRule(rulePath: RulePath): rule_t | null {
    let result: rule_t | null = null;
    const treeNode: ruleTree_t | any = this.getTreeNode(this.rules, rulePath);
    if (treeNode) {
      result = treeNode;
    }
    return result;
  }

  getPath(rulePath: RulePath, chunk: string): RulePath {
    const treeNode = this.getTreeNode(this.rules, rulePath);
    if (treeNode !== null && treeNode['rules'] !== undefined) {
      rulePath.push('rules');
    }
    rulePath.push(chunk);
    return rulePath;
  }

}
