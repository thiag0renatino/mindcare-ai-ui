import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';

import { HistoryService } from '../../core/services/history.service';
import { StoredAnalysis } from '../../models/mindcheck.models';

@Component({
  selector: 'app-analysis-details',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './analysis-details.component.html',
  styleUrl: './analysis-details.component.css'
})
export class AnalysisDetailsComponent implements OnInit {
  entry: StoredAnalysis | null = null;
  activeTab = 'Requisição';
  tabs = ['Requisição', 'Resultado da IA', 'Triagem persistida', 'Encaminhamento'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.entry = this.historyService.getById(id) ?? null;
    if (this.entry && !this.entry.response.encaminhamento) {
      this.tabs = this.tabs.filter((tab) => tab !== 'Encaminhamento');
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  runAgain(): void {
    if (!this.entry) {
      return;
    }
    this.historyService.saveDraft(this.entry.request);
    this.router.navigate(['/analysis/new']);
  }

  riskClass(risk: string | undefined): string {
    if (!risk) {
      return 'risk-unknown';
    }
    const normalized = risk.toUpperCase();
    if (normalized === 'ALTO') {
      return 'risk-high';
    }
    if (normalized === 'MODERADO') {
      return 'risk-moderate';
    }
    return 'risk-low';
  }
}
