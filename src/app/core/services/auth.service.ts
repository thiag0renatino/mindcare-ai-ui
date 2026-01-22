import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Inject } from '@angular/core';
import { AuthRegisterRequest, AuthSignInRequest, TokenResponse } from '../../models/auth.models';

const TOKEN_STORAGE_KEY = 'mindcareai.jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(this.readToken());
  readonly token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  setToken(token: string): void {
    const trimmed = token.trim();
    if (this.canUseStorage()) {
      localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    }
    this.tokenSubject.next(trimmed);
  }

  clearToken(): void {
    if (this.canUseStorage()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    this.tokenSubject.next(null);
  }

  signIn(payload: AuthSignInRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.apiBaseUrl}/auth/signin`, payload)
      .pipe(
        tap((response) => {
          if (response?.accessToken) {
            this.setToken(response.accessToken);
          }
        })
      );
  }

  register(payload: AuthRegisterRequest): Observable<string> {
    return this.http.post(`${this.apiBaseUrl}/auth/register`, payload, {
      responseType: 'text'
    });
  }

  private readToken(): string | null {
    if (!this.canUseStorage()) {
      return null;
    }
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
