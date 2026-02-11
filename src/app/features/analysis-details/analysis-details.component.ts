import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { HistoryService } from '../../core/services/history.service';
import { EncaminhamentoResponse, TriagemResponse } from '../../models/mindcheck.models';

@Component({
  selector: 'app-analysis-details',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './analysis-details.component.html',
  styleUrl: './analysis-details.component.css'
})
export class AnalysisDetailsComponent implements OnInit {
  entry: TriagemResponse | null = null;
  encaminhamentos: EncaminhamentoResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.loading = false;
      return;
    }
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      this.loading = false;
      return;
    }
    this.historyService.getById(id).subscribe({
      next: (triagem) => {
        this.entry = triagem;
        this.loading = false;
        this.loadEncaminhamentos(triagem);
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os detalhes da triagem.';
        this.loading = false;
      }
    });
  }

  runAgain(): void {
    if (!this.entry) {
      return;
    }
    this.historyService.saveDraft({
      usuarioId: this.entry.usuario?.id ?? null,
      relato: this.entry.relato ?? ''
    });
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

  riskBannerClass(risk: string | undefined): string {
    if (!risk) {
      return 'risk-banner risk-banner-unknown';
    }
    const normalized = risk.toUpperCase();
    if (normalized === 'ALTO') {
      return 'risk-banner risk-banner-high';
    }
    if (normalized === 'MODERADO') {
      return 'risk-banner risk-banner-moderate';
    }
    if (normalized === 'BAIXO') {
      return 'risk-banner risk-banner-low';
    }
    return 'risk-banner risk-banner-unknown';
  }

  riskLabel(risk: string | undefined): string {
    if (!risk) {
      return 'Não identificado';
    }
    const normalized = risk.toUpperCase();
    if (normalized === 'BAIXO') {
      return 'Risco Baixo';
    }
    if (normalized === 'MODERADO') {
      return 'Risco Moderado';
    }
    if (normalized === 'ALTO') {
      return 'Risco Alto';
    }
    return risk;
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) {
      return '—';
    }
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTime;
    }
  }

  private loadEncaminhamentos(triagem: TriagemResponse): void {
    const risco = (triagem.risco ?? '').toUpperCase();
    if ((risco === 'ALTO' || risco === 'MODERADO') && triagem.id) {
      this.historyService.getEncaminhamentosByTriagem(triagem.id).subscribe({
        next: (data) => (this.encaminhamentos = data),
      });
    }
  }
}
