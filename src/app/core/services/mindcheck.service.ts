import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { MindCheckAiRequest, MindCheckAiResponse } from '../../models/mindcheck.models';

@Injectable({ providedIn: 'root' })
export class MindCheckService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  analyze(payload: MindCheckAiRequest): Observable<MindCheckAiResponse> {
    return this.http.post<MindCheckAiResponse>(
      `${this.apiBaseUrl}/api/mindcheck-ai/analises`,
      payload
    );
  }
}
