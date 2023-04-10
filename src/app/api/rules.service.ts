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
  weekdays?: string | string[],
  duration?: number | string,
  cooldownInSeconds?: number,
  delayInSeconds?: number,
  qos?: number,
  errors?: string
}

export type rules_t = rule_t[];

export type ruleTree_t = {
  rule?: rule_t;
  childs?: {
    [index: string]: ruleTree_t;
  }
}

export type ruleTreeExternalFormat_t = {
  [index:string]: ruleTreeExternalFormat_t | any
}

export class RulePath {
  chunks: string[];
  name: string | null = null;

  constructor(chunks: string[] = [], name: string | null = null) {
    this.chunks = [...chunks];
    this.name = name;
  }

  clone = () => new RulePath(this.chunks, this.name);
  shift = () => {
    let result = this.chunks.shift();
    if (result === undefined && this.name) {
      result = this.name;
      this.name = null;
    }
    return result;
  };

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
  toTopic = () => this.chunks.join('/') + (this.name !== null ? `/${this.name}` : "");

  /**
   * Checks, if the chunk list is empty
   * @returns true, if the chunk list is empty
   */
  isEmpty = () => this.chunks.length === 0 && this.name === null;

  /**
   * Pops the last item from the path
   * @returns the last item just removed
   */
  pop(): string | undefined {
    let result: string | undefined;
    if (this.name !== null) {
      result = this.name;
      this.name = null;
    } else {
      result = this.chunks.pop();
    }
    return result;
  }

  /**
   * pushes a new item to the path
   */
  push(chunk: string) {
    this.chunks.push(chunk);
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
  readRules(): Observable<HttpResponse<ruleTreeExternalFormat_t>> {
    const topic = 'automation/rules';
    return this.httpClient.get<ruleTree_t>(environment.configHost + topic, { observe: 'response' });
  }

  /**
   * Gets the rules tree from the local store
   */
  private getRulesFromLocalStore() {
    let rules = {}
    return rules;
    /*
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
    */
  }

  /**
   * Writes the rules tree to the local store
   */
  public writeRulesToLocalStore() {
    if (this.rules) {
      localStorage.setItem(this.storeName, JSON.stringify(this.rules));
    }
  }

  /**
   * Sets the rule tree from an input in external format
   * @param rules rules in external format
   * @param cur current node, leave empty!!
   */
  setRulesFromExternalFormat(rules: ruleTreeExternalFormat_t, node: ruleTree_t | null = null) {
    if (node === null) {
      node = this.rules;
    }
    if (!node.childs) {
      node.childs = {}
    }
    for (const name in rules) {
      if (name === 'rules') {
        const ruleList = rules['rules'];
        for (const name in ruleList) {
          node.childs[name] = { rule: ruleList[name] }
        }
      } else {
        node.childs[name] = {}
        this.setRulesFromExternalFormat(rules[name], node.childs[name])
      }
    }
  }

  /**
   * Runs through the tree to select a tree node
   * @param node current node to the tree
   * @param rulePath path to the node
   * @returns node of the tree
   */
  private getTreeNodeRec(node: ruleTree_t, rulePath: RulePath): ruleTree_t | null {
    let result: ruleTree_t | null = node;
    if (!rulePath.isEmpty()) {
      const clonedPath = rulePath.clone();
      const ruleChunk = clonedPath.shift();
      if (ruleChunk) {
        if (!node.childs) {
          node.childs = {}
        }
        if (!node.childs[ruleChunk]) {
          node.childs[ruleChunk] = {}
        }
        result = this.getTreeNodeRec(node.childs[ruleChunk], clonedPath);
      } else {
        result = null;
      }
    }
    return result;
  }

  /**
   * Gets the node of the rules tree
   * @param rulePath path to the node
   * @returns tree node or null if not found
   */
  getTreeNode(rulePath: RulePath): ruleTree_t | null {
    return this.getTreeNodeRec(this.rules, rulePath);
  }

  /**
   * Updates a node in the tree
   * @param rulePath path to the node
   * @returns node of the tree
   */
  updateTreeNode(rulePath: RulePath, newRule: rule_t) {
    const clonedPath = rulePath.clone();
    const curName = clonedPath.pop();
    const newName = newRule.name?.split('/').at(-1);
    const node = this.getTreeNode(clonedPath);
    
    if (newName !== undefined && node) {
      if (node.childs === undefined) {
        node.childs = {}
      }
      node.childs[newName] = { rule: newRule };
      if (newName !== curName && curName) {
        delete node.childs[curName];
      }
    }
  }

  /**
   * Deletes a node and all parent noded, if they are empty after the deletion
   * @param rulePath path to the node
   * @returns rulePath to the first parent node with childs
   */
  deleteNode(rulePath: RulePath): RulePath {
    let clonedPath = rulePath.clone();
    const curName = clonedPath.pop();
    const node = this.getTreeNode(clonedPath);

    if (curName && node && node.childs) {
      delete node.childs[curName];
      // 
      if (Object.keys(node.childs).length === 0) {
        clonedPath = this.deleteNode(clonedPath);
      }
    }
    return clonedPath;
  }

  /**
   * Gets the list of names of the current tree path
   * @param rulePath path to the node
   */
  getNameList(rulePath: RulePath): string[] {
    const clonedPath = rulePath.clone();
    let treeNode: ruleTree_t | null = this.getTreeNode(clonedPath);
    let result: string[] = [];

    if (treeNode) {
      for (const name in treeNode.childs) {
        result.push(name);
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
    const treeNode: ruleTree_t | any = this.getTreeNode(rulePath);
    if (treeNode && treeNode.rule) {
      result = treeNode.rule;
    }
    return result;
  }

  /**
   * Adds a piece to a path, if the corresponding node exists in the tree
   * @param rulePath current path
   * @param chunk element to add to the path
   * @returns new path
   */
  getPath(rulePath: RulePath, chunk: string): RulePath {
    const result = rulePath.clone();
    result.name = null;
    const node = this.getTreeNode(result);
    if (node && node.childs && node.childs[chunk]) {
      if (node.childs[chunk].rule) {
        result.name = chunk;
      } else {
        result.push(chunk);
      }
    }
    return result;
  }
  
}
