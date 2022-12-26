import { Component, Input, Output, EventEmitter } from '@angular/core';
import { INavSettings, SettingsService } from 'src/app/settings/settings.service';
import { MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.less']
})
export class SidenavComponent {

  @Input() navItems: string[] | null = null;
  @Input() topicChunks: string[] | null = null;
  @Input() enableConfiguration: boolean = false;
  @Output() navItemEvent = new EventEmitter<string>();

  settings: INavSettings | null = null;
  enabledNavItems: string[] = [];

  constructor(public settingService:SettingsService) {

  }

  ngOnChanges() {
    if (this.topicChunks !== null) {
      this.settings = this.settingService.getNavSettings(this.topicChunks);
      this.updateEnabledNavItems();
    }
  }

  /**
   * updates the list of enabled navigation items
   */
  updateEnabledNavItems(): void {
    if (!this.navItems) {
      return;
    }
    const enabled: string[] = [];
    for (const navItem of this.navItems) {
      if (this.settings?.isEnabled(navItem)) {
        enabled.push(navItem);
      }
    }
    this.enabledNavItems = enabled;
  }

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
    if (!this.navItems || this.navItems.length === 0) {
      return false;
    }
    const pos = 0;
    return navItem === this.navItems[pos];
  }

  /**
   * Checks wether a navigation item is selected
   * @param navItem item to check
   * @returns true, if a navigation item is selected
   */
  isSelected(navItem: string): boolean {
    if (!this.settings) {
      return true;
    }
    return this.settings.isEnabled(navItem);
  }

  /**
   * Triggered, if a selection has been changed. It will change the selection options
   * @param event selection event
   */
  onSelectionChange(event: MatSelectionListChange) {
    for (const option of event.options) {
      this.settings?.setEnabled(option.value, option.selected)
    }
  }

  /**
   * Switches between configuration and navigation mode
   * @param mode configuration mode: true -> configuration, false: navigation
   */
  setConfigurationMode(mode: boolean): void {
    this.enableConfiguration = mode;
    if (mode === false) {
      this.updateEnabledNavItems();
      this.settingService.writeToLocalStore();
    }
  }

  /**
   * Creates the string to show on the configuration button
   * @returns string to show on the configuation button
   */
  getConfiguationString(): string {
    let result = "Configure";
    if (this.settings?.allEnabled()) {
      result += ' ...'
    } else {
      result += ' (+' + this.settings?.countDisabled() + ')'
    }
    return result
  }

}
