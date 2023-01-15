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
  day?: string | string[],
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
}
