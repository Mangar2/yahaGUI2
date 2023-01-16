import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rule-nav',
  templateUrl: './rule-nav.component.html',
  styleUrls: ['./rule-nav.component.less']
})
export class RuleNavComponent {

  _chunkList: string[] | null = null;
  @Output() chunkSelected = new EventEmitter<string>();

  @Input() 
  set chunkList(chunkList: string[] | null) {
    this._chunkList = chunkList;
  }

  get chunkList() {
    return this._chunkList;
  }

  isActive(chunk: string): boolean {
    return false;
  }

  upload(): void {

  }

  onSelect(chunk: string): void {
    this.chunkSelected.emit(chunk);
  }

}
