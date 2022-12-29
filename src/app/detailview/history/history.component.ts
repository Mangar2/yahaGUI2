import { Component, Input } from '@angular/core';
import { IHistory, IReasons } from 'src/app/data/message';
import { IStorageNode } from 'src/app/data/message-tree.service';
import { INavSettings } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.less']
})
export class HistoryComponent {

  _navSettings: INavSettings | null = null;
  _topicNode: IStorageNode | null = null;

  displayedColumns = ["value", "reason"]

  history: { time: string, reason: string }[] | null = null;

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
    console.log(this._topicNode);
  }

  /**
   * Checks, if a date is today
   * @param date date to check
   * @returns true, if the date is today
   */
  isToday(date: Date): boolean {
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
      result = result + spacer + index + '. ' + reason.message;
      result = result + this.beautifyTimeString(reason.timestamp, addDate);
      addDate = false;
      spacer = " ";
    }
    if (result === "") {
      result = this.beautifyTimeString(historyElement.time, true) + " (Updated)";
    }
    return result;
  }

}
