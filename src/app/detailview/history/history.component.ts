/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2023 Volker Böhm
 * @Overview View Component showing a history-table with paginator
 */

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table';
import { IHistory, IHistoryList, IReasons } from 'src/app/data/message';
import { IStorageNode } from 'src/app/data/message-tree.service';
import { INavSettings } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.less']
})
export class HistoryComponent implements AfterViewInit {

  _navSettings: INavSettings | null = null;
  _topicNode: IStorageNode | null = null;

  displayedColumns = ["value", "reason"]
  dataSource = new MatTableDataSource<IHistory>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  get navSettings(): INavSettings | null {
    return this._navSettings;
  }

  @Input()
  set navSettings(navSettings: INavSettings | null) {
    this._navSettings = navSettings;

  }

  get topicNode(): IStorageNode | null {
    return this._topicNode;
  }

  @Input()
  set topicNode(topicNode: IStorageNode | null) {
    this._topicNode = topicNode;
    if (this.topicNode && this.topicNode.history) {
      this.updateHistory(this.topicNode);
    }
  }

  /**
   * Updates the history data as input for the table and its paginator
   * @param topicNode data node of the current topic
   */
  private updateHistory(topicNode: IStorageNode) {
    if (!topicNode.history) {
      return;
    }
    let curNode: IHistory = { 
      time: topicNode.time, 
      value: topicNode.value, 
      reason: topicNode.reason
    }
    const newHistory: IHistoryList = [];
    newHistory.push(curNode);
    newHistory.push(...topicNode.history);
    this.dataSource = new MatTableDataSource<IHistory>(newHistory);
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Checks, if a date is today
   * @param date date to check
   * @returns true, if the date is today
   */
  private isToday(date: Date): boolean {
    let todaysDate = new Date();
    return date.setHours(0, 0, 0, 0) === todaysDate.setHours(0, 0, 0, 0);
  }

  /**
   * Returns the time and optionally the date in a nice to read form
   * @param timestamp timestamp to beautify
   * @param addDate if true, the date is added, else it only returns the time
   * @returns 
   */
  beautifyTimeString(timestamp: string | undefined, addDate: boolean): string {
    if (timestamp === undefined) {
      return "";
    }
    let date = new Date(timestamp)
    if (timestamp === undefined || timestamp === "" || isNaN(date.getTime())) {
      return timestamp ? timestamp : 'unknown'
    }
    const timeStr = date.toLocaleTimeString()
    const dateStr = this.isToday(date) ? 'Today' :
      date.toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "2-digit" })
    const result = addDate ? dateStr + ", " + timeStr : timeStr;
    return result
  }

  /**
   * Returns the reason information as string
   * @param reasons List of logging information for a value event
   * @returns Displayable string containing all reason informations
   */
  public getReasonString(historyElement: IHistory): string {
    const reasons: IReasons = historyElement.reason ? historyElement.reason: [];
    let result = "";
    let spacer = "";
    let addDate = true;
    for (const index in reasons) {
      const reason = reasons[index];
      result = result + spacer + (Number(index) + 1) + '. ' + reason.message;
      result = result + ' (' + this.beautifyTimeString(reason.timestamp, addDate) + ')';
      addDate = false;
      spacer = " ";
    }
    if (result === "") {
      result = this.beautifyTimeString(historyElement.time, true) + " (Updated)";
    }
    return result;
  }

}
