import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { UsuarioResponse } from '../../models/mindcheck.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  me(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.apiBaseUrl}/api/usuarios/me`);
  }
}
