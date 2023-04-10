import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IClients } from 'src/app/api/clients.service';

@Component({
  selector: 'app-clients-nav',
  templateUrl: './clients-nav.component.html',
  styleUrls: ['./clients-nav.component.less']
})
export class ClientsNavComponent {

  @Output() clientSelected = new EventEmitter<string>();

  _clients: IClients | null = null;
  _nav: string = '';
  _active: string = '';
  navList: string[] = [];
  

  @Input() 
  set clients(clients: IClients | null) {
    this._clients = clients;
    this.updateNavList('');
  }

  /**
   * Updates the list of navigation options
   * @param nav current position in the navigation menu
   */
  updateNavList(nav: string) {
    this._nav = nav;
    const navList: string[] = [];
    if (nav != '') {
      navList.push('<');
    }
    if (this._clients === null) {
      return;
    }
    for (let path in this._clients) {
      if (path.startsWith(nav)) {
        const pos = nav === '' ? 0: nav.length + 1;
        const tail = path.substring(pos);
        const tailChunks = tail.split('/');
        const chunk = tailChunks[0];
        if (chunk && !navList.includes(chunk)) {
          navList.push(chunk)
        }
      }
    }
    this.navList = navList;
  }

  /**
   * Gets the type of the currently active selection
   * @param chunk active selection
   * @returns type
   */
  getType(chunk: string) {
    return chunk === this._active ? 'active' : 'nav';
  }

  /**
   * Selects a chunk
   * @param chunk name of the selected chunk
   */
  onSelect(chunk: string) {
    if (this._clients === null) {
      return;
    }
    let nav: string = '';
    if (chunk === '<') {
      const chunks = this._nav.split('/');
      chunks.pop();
      nav = chunks.join('/');
    } else if (this._nav === '') {
        nav = chunk;
    } else {
      nav = `${this._nav}/${chunk}`;
    }
    if (this._clients[nav] === undefined) {
      this.updateNavList(nav);
    } else {
      this._active = chunk;
      this.clientSelected.emit(nav);
    }
  }

}
