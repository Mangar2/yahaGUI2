import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rule-nav',
  templateUrl: './rule-nav.component.html',
  styleUrls: ['./rule-nav.component.less']
})
export class RuleNavComponent {

  _chunkList: string[] | null = null;
  @Output() chunkSelected = new EventEmitter<string>();
  @Output() newRuleSelected = new EventEmitter<void>();

  @Input() activeChunk: string | null = null;

  @Input() 
  set chunkList(chunkList: string[] | null) {
    this._chunkList = chunkList;
  }

  get chunkList() {
    return this._chunkList;
  }

  /**
   * Returns true, if an element shall be show as active 
   * @param chunk currently shown element
   * @returns 
   */
  getType(chunk: string): string {
    if (chunk === this.activeChunk) return 'active';
    if (chunk === 'add rule') return 'new';
    return 'nav';
  }

  onSelect(chunk: string): void {
    if (chunk === 'add rule') {
      this.newRuleSelected.emit();
    } else {
      this.chunkSelected.emit(chunk);
    }
  }

}
