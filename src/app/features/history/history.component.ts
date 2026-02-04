import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HistoryService } from '../../core/services/history.service';
import { PaginationComponent } from '../../core/components/pagination.component';
import { TriagemResponse } from '../../models/mindcheck.models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, DatePipe, PaginationComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  history: TriagemResponse[] = [];
  loading = true;
  errorMessage = '';

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.historyService.list(page, this.pageSize).subscribe({
      next: (response) => {
        this.history = response.content;
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar o histórico.';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.loadPage(page);
  }

  riskLabel(entry: TriagemResponse): string {
    return entry.risco ?? 'DESCONHECIDO';
  }

  hasReferral(entry: TriagemResponse): boolean {
    const risk = (entry.risco ?? '').toUpperCase();
    return risk === 'MODERADO' || risk === 'ALTO';
  }

  excerpt(entry: TriagemResponse): string {
    const text = entry.relato ?? '';
    return text.length > 70 ? `${text.slice(0, 70)}...` : text;
  }
}