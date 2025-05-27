import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from './services/cliente.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  clientes: any[] = [];
  formulario: FormGroup;

  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);

  constructor() {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: ['']
    });
  }

  ngOnInit() {
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.clienteService.getClientes().subscribe((data: any[]) => {
      this.clientes = data;
    });
  }

enviar() {
  if (this.formulario.valid) {
    const nuevoCliente = this.formulario.value;
    this.clienteService.crearCliente(nuevoCliente).subscribe({
      next: () => {
        this.obtenerClientes(); // ✅ Refresca los datos desde el backend
        this.formulario.reset();
      },
      error: (err) => console.error('Error al crear cliente:', err)
    });
  }
}

  eliminarCliente(id: number) {
    this.clienteService.eliminarCliente(id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(c => c.id !== id);
      },
      error: (err) => console.error('Error al eliminar cliente:', err)
    });
  }
}