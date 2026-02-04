import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import {
  EncaminhamentoResponse,
  MindCheckAiRequest,
  PageResponse,
  TriagemResponse,
} from '../../models/mindcheck.models';
import { UserContextService } from './user-context.service';

const DRAFT_STORAGE_KEY = 'mindcareai.draft';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string,
    private userContextService: UserContextService,
  ) {}

  list(page = 0, size = 10): Observable<PageResponse<TriagemResponse>> {
    const usuarioId = this.userContextService.getUsuarioId();
    return this.http.get<PageResponse<TriagemResponse>>(
      `${this.apiBaseUrl}/api/triagens/usuario/${usuarioId}`,
      { params: { page: page.toString(), size: size.toString(), sort: 'dataHora,DESC' } },
    );
  }

  getById(id: number): Observable<TriagemResponse> {
    return this.http.get<TriagemResponse>(
      `${this.apiBaseUrl}/api/triagens/${id}`,
    );
  }

  getEncaminhamentosByTriagem(triagemId: number): Observable<EncaminhamentoResponse[]> {
    return this.http
      .get<PageResponse<EncaminhamentoResponse>>(
        `${this.apiBaseUrl}/api/encaminhamentos/triagem/${triagemId}`,
        { params: { page: '0', size: '20', sort: 'id,DESC' } },
      )
      .pipe(map((page) => page.content));
  }

  saveDraft(request: MindCheckAiRequest): void {
    if (this.canUseStorage()) {
      localStorage.setItem(this.draftStorageKey(), JSON.stringify(request));
    }
  }

  consumeDraft(): MindCheckAiRequest | null {
    if (!this.canUseStorage()) {
      return null;
    }
    const raw = localStorage.getItem(this.draftStorageKey());
    if (!raw) {
      return null;
    }
    localStorage.removeItem(this.draftStorageKey());
    return JSON.parse(raw) as MindCheckAiRequest;
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private draftStorageKey(): string {
    const userId = this.userContextService.getUsuarioId();
    return userId
      ? `${DRAFT_STORAGE_KEY}.${userId}`
      : `${DRAFT_STORAGE_KEY}.anonymous`;
  }
}
