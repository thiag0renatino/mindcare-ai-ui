import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { EmpresaResponse } from '../../models/mindcheck.models';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  listar(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.apiBaseUrl}/empresas`);
  }
}
