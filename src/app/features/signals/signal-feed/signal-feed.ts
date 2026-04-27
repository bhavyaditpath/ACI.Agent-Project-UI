import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CompetitorService } from '../../../core/services/competitor';
import { SignalService } from '../../../core/services/signal';
import { Competitor } from '../../../core/models/competitor.model';
import { Signal } from '../../../core/models/signal.model';

@Component({
  selector: 'app-signal-feed',
  imports: [CommonModule, FormsModule, CardModule, SelectModule, TagModule, ButtonModule, MessageModule],
  templateUrl: './signal-feed.html',
  styleUrl: './signal-feed.css',
})
export class SignalFeedComponent implements OnInit {
  private readonly signalService = inject(SignalService);
  private readonly competitorService = inject(CompetitorService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly daysOptions = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 }
  ];

  readonly agentOptions = [
    { label: 'All', value: 'All' },
    { label: 'WebWatcher', value: 'WebWatcher' },
    { label: 'JobBoard', value: 'JobBoard' },
    { label: 'RssFeed', value: 'RssFeed' },
    { label: 'Reddit', value: 'Reddit' },
    { label: 'HackerNews', value: 'HackerNews' }
  ];

  competitors: Competitor[] = [];
  competitorOptions: Array<{ label: string; value: string }> = [{ label: 'All Competitors', value: 'all' }];

  signals: Signal[] = [];
  filteredSignals: Signal[] = [];
  filteredSignalsCount = 0;

  selectedCompetitor = 'all';
  selectedDays = 7;
  selectedAgent = 'All';

  ngOnInit(): void {
    this.loadCompetitors();
    this.loadSignals();
  }

  loadCompetitors(): void {
    this.competitorService.getAll().subscribe((competitors) => {
      this.competitors = competitors;
      this.competitorOptions = [
        { label: 'All Competitors', value: 'all' },
        ...competitors.map((c) => ({ label: c.name, value: c.id }))
      ];
      this.cdr.detectChanges();
    });
  }

  loadSignals(): void {
    const source$ =
      this.selectedCompetitor === 'all'
        ? this.signalService.getRecent(this.selectedDays)
        : this.signalService.getByCompetitor(this.selectedCompetitor);

    source$.subscribe((signals) => {
      this.signals = signals;
      this.applyClientFilters();
      this.cdr.detectChanges();
    });
  }

  onCompetitorChange(): void {
    this.loadSignals();
  }

  onDaysChange(): void {
    this.loadSignals();
  }

  onAgentChange(): void {
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.selectedCompetitor = 'all';
    this.selectedDays = 7;
    this.selectedAgent = 'All';
    this.loadSignals();
  }

  applyClientFilters(): void {
    const now = Date.now();
    const daysMs = this.selectedDays * 24 * 60 * 60 * 1000;
    this.filteredSignals = this.signals.filter((signal) => {
      const agentMatch = this.selectedAgent === 'All' || signal.agentType === this.selectedAgent;
      const daysMatch = now - new Date(signal.occurredAt).getTime() <= daysMs;
      return agentMatch && daysMatch;
    });
    this.filteredSignalsCount = this.filteredSignals.length;
  }

  getAgentSeverity(agentType: string): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
    switch (agentType) {
      case 'WebWatcher':
        return 'info';
      case 'JobBoard':
        return 'success';
      case 'RssFeed':
        return 'warn';
      case 'Reddit':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getImportanceStars(score: number): string {
    return '★'.repeat(Math.min(3, Math.max(1, score)));
  }

  getTimeAgo(dateIso: string): string {
    const diffMs = Date.now() - new Date(dateIso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hours ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }
}
