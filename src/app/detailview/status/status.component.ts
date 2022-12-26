import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.less']
})
export class StatusComponent {

  @Input() nodeName: string = "";
  @Input() nodeValue: string = "";

}
