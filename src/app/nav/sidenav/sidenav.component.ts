import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.less']
})
export class SidenavComponent {

  @Input() navItems: string[] | null = null;
  @Output() navItemEvent = new EventEmitter<string>();

  constructor() {}

  /**
   * Called, when a navigation item is clicked
   * @param navItem navigation item name
   */
  onClick(navItem: string) {
    this.navItemEvent.emit(navItem);
  }

  /**
   * Checks, if an item is the active item
   * @param navItem item to check
   * @returns true, if the item to check is the active item
   */
  isActive(navItem: string): boolean {
    if (!this.navItems || this.navItems.length < 2) {
      return false;
    }
    const pos = (this.navItems[0] === 'favorites') ? 0 : 1;
    
    return navItem === this.navItems[pos];
  }

}
