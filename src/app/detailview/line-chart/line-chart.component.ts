import { Component, Input } from '@angular/core';
import { IStorageNode } from 'src/app/data/message-tree.service';
import { INavSettings } from 'src/app/settings/settings.service';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.less']
})
export class LineChartComponent {

  _navSettings: INavSettings | null = null;
  _topicNode: IStorageNode | null = null;
  chart: any = null;
  data: { x: number, y: number }[] = [];

  @Input()
  set navSettings(navSettings: INavSettings | null) {
    this._navSettings = navSettings;
  }

  @Input()
  set topicNode(topicNode: IStorageNode | null) {
    this._topicNode = topicNode;
    if (this.topicNode && this.topicNode.history) {
      this.updateHistory(this.topicNode);
    }
  }

  get topicNode(): IStorageNode | null {
    return this._topicNode;
  }

  /**
   * Updates the history data as input for the table and its paginator
   * @param topicNode data node of the current topic
   */
  private updateHistory(topicNode: IStorageNode) {
    if (!topicNode.history) {
      return;
    }
    if (topicNode.time && topicNode.value !== undefined) {
      const x = (new Date(topicNode.time)).getTime();
      const y = Number(topicNode.value);
      this.data.push({ x, y })
    }
    const now = Date.now();
    const msInDay = 24 * 3600 * 1000;
    for (const point of topicNode.history) {
      if (point.time && point.value !== undefined) {
        const x = (new Date(point.time)).getTime();
        const y = Number(point.value);
        if (now - x < msInDay * 5) {
          this.data.push({ x, y });
        }
      }
    }
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }

  private createChart() {

    this.chart = new Chart('line-chart', {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Chart',
            data: this.data
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          y: {
            ticks: {
            }
          },
          x: {
            ticks: {
              callback: function(value) { 
                  return new Date(value).toLocaleString('de-DE', {month: "numeric", day:"numeric"}); 
              },
          },
          }
        },
      }
    });
  }
}


