import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = 'http://localhost:3001/api/clientes';

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

 crearCliente(cliente: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/crear`, cliente);
}

eliminarCliente(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/borrar/${id}`);
}

editarCliente(id: number, cliente: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/actualizar/${id}`, cliente);
}
}