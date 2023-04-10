import { Component } from '@angular/core';
import { ClientsService, IClient, IClients } from 'src/app/api/clients.service';

@Component({
  selector: 'app-clients-controller',
  templateUrl: './clients-controller.component.html',
  styleUrls: ['./clients-controller.component.less']
})
export class ClientsControllerComponent {
  clients: IClients | null = null;
  selectedClient: IClient | null = null;

  constructor(private clientsService: ClientsService) {
  }

  ngOnInit() {
    this.clientsService.readClients().subscribe((clients: IClients) => {
      this.clients = clients;
    })
  }

  /**
   * Shows a selected client
   * @param client name of the selected client
   */
  onClientSelected(client: string) {
    if (this.clients && this.clients[client] !== undefined) {
      this.selectedClient = this.clients[client];
      console.log(this.selectedClient);
    }
  }


}
