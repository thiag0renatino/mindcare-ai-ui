import { Injectable } from '@angular/core';
import { MindCheckAiRequest, MindCheckAiResponse, StoredAnalysis } from '../../models/mindcheck.models';

const HISTORY_STORAGE_KEY = 'mindcareai.history';
const DRAFT_STORAGE_KEY = 'mindcareai.draft';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  list(): StoredAnalysis[] {
    return this.readHistory();
  }

  add(entry: StoredAnalysis): void {
    const history = this.readHistory();
    history.unshift(entry);
    if (this.canUseStorage()) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }

  getById(id: string): StoredAnalysis | undefined {
    return this.readHistory().find((item) => item.id === id);
  }

  saveDraft(request: MindCheckAiRequest): void {
    if (this.canUseStorage()) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(request));
    }
  }

  consumeDraft(): MindCheckAiRequest | null {
    if (!this.canUseStorage()) {
      return null;
    }
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return JSON.parse(raw) as MindCheckAiRequest;
  }

  private readHistory(): StoredAnalysis[] {
    if (!this.canUseStorage()) {
      return [];
    }
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as StoredAnalysis[];
    } catch {
      return [];
    }
  }

  createEntry(request: MindCheckAiRequest, response: MindCheckAiResponse): StoredAnalysis {
    return {
      id: this.createId(),
      createdAt: new Date().toISOString(),
      request,
      response
    };
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `analysis-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
