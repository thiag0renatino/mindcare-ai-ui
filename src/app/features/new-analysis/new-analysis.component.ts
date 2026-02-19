import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { MindCheckService } from '../../core/services/mindcheck.service';
import { HistoryService } from '../../core/services/history.service';
import { MindCheckAiRequest, MindCheckAiResponse } from '../../models/mindcheck.models';
import { UserContextService } from '../../core/services/user-context.service';
import { UserService } from '../../core/services/user.service';

type StepState = 'pending' | 'active' | 'done';

@Component({
  selector: 'app-new-analysis',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './new-analysis.component.html',
  styleUrl: './new-analysis.component.css'
})
export class NewAnalysisComponent implements OnInit, OnDestroy {
  readonly analysisForm = this.fb.group({
    relato: ['', [Validators.required, Validators.minLength(10)]],
    sintomas: [''],
    humor: [''],
    rotina: ['']
  });

  loading = false;
  errorMessage = '';
  result: MindCheckAiResponse | null = null;
  copiedMessage = '';

  steps = [
    { label: 'Enviando relato', state: 'pending' as StepState },
    { label: 'IA gerando resposta estruturada', state: 'pending' as StepState },
    { label: 'Persistindo triagem', state: 'pending' as StepState },
    { label: 'Criando encaminhamentos (se necessário)', state: 'pending' as StepState }
  ];

  private stepTimer: number | null = null;
  private copiedTimer: number | null = null;

  constructor(
    private fb: FormBuilder,
    private mindCheckService: MindCheckService,
    private historyService: HistoryService,
    private userContextService: UserContextService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const draft = this.historyService.consumeDraft();
    if (draft) {
      this.analysisForm.patchValue(draft);
    }
    const savedUserId = this.userContextService.getUsuarioId();
    if (!savedUserId) {
      this.fetchCurrentUser();
    }
  }

  ngOnDestroy(): void {
    this.stopProgress();
    this.clearTimers();
  }

  submit(): void {
    this.errorMessage = '';
    this.result = null;
    if (this.analysisForm.invalid) {
      this.analysisForm.markAllAsTouched();
      return;
    }
    const userId = this.userContextService.getUsuarioId();
    if (!userId) {
      this.errorMessage = 'Não foi possível identificar o usuário autenticado.';
      return;
    }

    const payload = this.buildPayload();
    this.loading = true;
    this.startProgress();

    this.mindCheckService.analyze(payload).subscribe({
      next: (response) => {
        this.result = response;
        this.completeProgress();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message ?? 'Não foi possível concluir a análise. Verifique a autenticação ou a API.';
        this.loading = false;
        this.stopProgress();
      }
    });
  }

  copySummary(): void {
    if (!this.result) {
      return;
    }
    const raw = this.buildSummary(this.result);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(raw);
      this.copiedMessage = 'Resumo copiado.';
      this.resetCopiedTimer();
      return;
    }
    const fallback = document.createElement('textarea');
    fallback.value = raw;
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
    this.copiedMessage = 'Resumo copiado.';
    this.resetCopiedTimer();
  }

  resetForm(): void {
    this.analysisForm.reset({
      relato: '',
      sintomas: '',
      humor: '',
      rotina: ''
    });
    this.result = null;
    this.errorMessage = '';
    this.stopProgress();
    this.steps = this.steps.map((step) => ({ ...step, state: 'pending' as StepState }));
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

  private buildPayload(): MindCheckAiRequest {
    return {
      usuarioId: Number(this.userContextService.getUsuarioId()),
      relato: this.analysisForm.value.relato ?? '',
      sintomas: this.analysisForm.value.sintomas ?? undefined,
      humor: this.analysisForm.value.humor ?? undefined,
      rotina: this.analysisForm.value.rotina ?? undefined
    };
  }

  private fetchCurrentUser(): void {
    this.userService.me().subscribe({
      next: (user) => {
        if (user?.id) {
          this.userContextService.setUsuarioId(user.id);
        }
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar o usuário logado.';
      }
    });
  }

  private buildSummary(result: MindCheckAiResponse): string {
    const lines: string[] = [];
    const addLine = (value: string) => lines.push(value);
    const addList = (title: string, items?: string[], emptyMessage?: string) => {
      addLine(title);
      if (!items?.length) {
        addLine(`- ${emptyMessage ?? 'Nenhuma informacao retornada.'}`);
        return;
      }
      items.forEach((item) => addLine(`- ${item}`));
    };

    addLine('Resultado da IA');
    addLine(`Risco: ${result.risco ?? 'DESCONHECIDO'}`);
    addLine(`Justificativa: ${result.justificativa ?? 'Nenhuma justificativa retornada.'}`);
    addList('Sugestoes:', result.sugestoes, 'Nenhuma sugestao retornada.');
    addList('Encaminhamentos sugeridos:', result.encaminhamentos, 'Nenhum encaminhamento sugerido.');

    addLine('');
    addLine('Triagem persistida');
    addLine(`Triagem ID: ${result.triagem?.id ?? '—'}`);
    addLine(`Usuario ID: ${result.triagem?.usuario?.id ?? '—'}`);
    addLine(`Data e hora: ${result.triagem?.dataHora ?? '—'}`);
    addLine(`Risco: ${result.triagem?.risco ?? result.risco ?? '—'}`);
    addLine(`Observacoes: ${result.triagem?.sugestao ?? 'Nenhuma observacao retornada.'}`);

    if (result.encaminhamentosCriados?.length) {
      result.encaminhamentosCriados.forEach((enc, idx) => {
        addLine('');
        addLine(`Encaminhamento ${idx + 1}`);
        addLine(`Encaminhamento ID: ${enc.id ?? '—'}`);
        addLine(`Prioridade: ${enc.prioridade ?? '—'}`);
        addLine(`Especialidade: ${enc.especialidade ?? '—'}`);
        addLine(`Status: ${enc.status ?? '—'}`);
        addLine(`Detalhes: ${enc.observacao ?? 'Encaminhamento criado automaticamente.'}`);
      });
    }

    return lines.join('\n');
  }

  private startProgress(): void {
    this.steps = this.steps.map((step) => ({ ...step, state: 'pending' }));
    let currentIndex = 0;
    this.steps[0].state = 'active';
    this.stepTimer = window.setInterval(() => {
      if (!this.loading) {
        return;
      }
      if (currentIndex < this.steps.length - 1) {
        this.steps[currentIndex].state = 'done';
        currentIndex += 1;
        this.steps[currentIndex].state = 'active';
      }
    }, 1200);
  }

  private completeProgress(): void {
    this.steps = this.steps.map((step) => ({ ...step, state: 'done' }));
    this.stopProgress();
  }

  private stopProgress(): void {
    if (this.stepTimer) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  private resetCopiedTimer(): void {
    if (this.copiedTimer) {
      window.clearTimeout(this.copiedTimer);
    }
    this.copiedTimer = window.setTimeout(() => {
      this.copiedMessage = '';
    }, 1800);
  }

  private clearTimers(): void {
    if (this.copiedTimer) {
      window.clearTimeout(this.copiedTimer);
      this.copiedTimer = null;
    }
  }
}
