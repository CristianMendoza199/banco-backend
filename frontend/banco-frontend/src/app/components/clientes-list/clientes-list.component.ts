import { Component, OnInit } from '@angular/core';
import { NgFor, AsyncPipe } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [NgFor],
  template: `
    <h2>Clientes</h2>
    <ul>
      <li *ngFor="let cliente of clientes">{{ cliente.nombre }}</li>
    </ul>
  `
})
export class ClienteListComponent implements OnInit {
  clientes: any[] = [];

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.clienteService.getClientes().subscribe(data => {
      this.clientes = data;
    });
  }
}