import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HistoryService } from '../../core/services/history.service';
import { StoredAnalysis } from '../../models/mindcheck.models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  history: StoredAnalysis[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.history = this.historyService.list();
  }

  riskLabel(entry: StoredAnalysis): string {
    return entry.response?.risco ?? 'DESCONHECIDO';
  }

  hasReferral(entry: StoredAnalysis): boolean {
    const risk = (entry.response?.risco ?? '').toUpperCase();
    return risk === 'MODERADO' || risk === 'ALTO';
  }

  excerpt(entry: StoredAnalysis): string {
    const text = entry.request?.relato ?? '';
    return text.length > 70 ? `${text.slice(0, 70)}...` : text;
  }
}
