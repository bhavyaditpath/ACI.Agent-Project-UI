import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CompetitorService } from '../../../core/services/competitor';
import { SignalService } from '../../../core/services/signal';
import { Competitor } from '../../../core/models/competitor.model';
import { Signal } from '../../../core/models/signal.model';

@Component({
  selector: 'app-signal-feed',
  imports: [CommonModule, FormsModule, CardModule, SelectModule, DatePickerModule, TagModule, ButtonModule, MessageModule, ToastModule],
  providers: [MessageService],
  templateUrl: './signal-feed.html',
  styleUrl: './signal-feed.css',
})
export class SignalFeedComponent implements OnInit {
  private readonly signalService = inject(SignalService);
  private readonly competitorService = inject(CompetitorService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly minSelectableDate = new Date(2010, 0, 1);

  readonly dateRangeOptions = [
    { label: 'Last 7 Days', value: 'Last7Days' },
    { label: 'Last 14 Days', value: 'Last14Days' },
    { label: 'Last 30 Days', value: 'Last30Days' },
    { label: 'All Time', value: 'AllTime' },
    { label: 'Custom Range', value: 'Custom' }
  ];

  readonly agentOptions = [
    { label: 'All', value: 'all' },
    { label: 'WebWatcher', value: 'WebWatcher' },
    { label: 'JobBoard', value: 'JobBoard' },
    { label: 'RssFeed', value: 'RssFeed' },
    { label: 'Reddit', value: 'Reddit' },
    { label: 'HackerNews', value: 'HackerNews' }
  ];

  readonly sentimentOptions = [
    { label: 'All Sentiments', value: 'all' },
    { label: 'Positive', value: 'Positive' },
    { label: 'Negative', value: 'Negative' },
    { label: 'Neutral', value: 'Neutral' }
  ];

  competitors: Competitor[] = [];
  competitorOptions: Array<{ label: string; value: string }> = [{ label: 'All Competitors', value: 'all' }];

  signals: Signal[] = [];
  filteredSignals: Signal[] = [];
  filteredSignalsCount = 0;

  selectedCompetitor = 'all';
  selectedDateRange = 'Last7Days';
  customFromDate: Date | null = null;
  customToDate: Date | null = null;
  today = new Date();
  selectedAgent = 'all';
  selectedSentiment = 'all';

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
    const { from, to } = this.getDateRange();
    const allTime = this.selectedDateRange === 'AllTime';

    this.signalService.getSignals(
      allTime ? undefined : from?.toISOString(),
      allTime ? undefined : to?.toISOString(),
      allTime
    ).subscribe((signals) => {
      this.signals = signals;
      this.applyClientFilters();
      this.cdr.detectChanges();
    });
  }

  onCompetitorChange(): void {
    this.applyClientFilters();
  }

  onDateRangeChange(): void {
    if (this.selectedDateRange === 'Custom') {
      if (this.isCustomDateRangeInvalid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Date Range',
          detail: 'Select dates between Jan 1, 2010 and today, and keep To Date on or after From Date.',
          life: 5000
        });
        return;
      }

      if (this.customFromDate && this.customToDate) {
        this.loadSignals();
      }
      return;
    }

    this.loadSignals();
  }

  onAgentChange(): void {
    this.applyClientFilters();
  }

  onSentimentChange(): void {
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.selectedCompetitor = 'all';
    this.selectedDateRange = 'Last7Days';
    this.customFromDate = null;
    this.customToDate = null;
    this.selectedAgent = 'all';
    this.selectedSentiment = 'all';
    this.loadSignals();
  }

  get isCustomDateRangeInvalid(): boolean {
    if (this.selectedDateRange !== 'Custom' || !this.customFromDate || !this.customToDate) {
      return false;
    }

    return (
      this.customFromDate > this.customToDate ||
      !this.isSelectableDate(this.customFromDate) ||
      !this.isSelectableDate(this.customToDate)
    );
  }

  private applyClientFilters(): void {
    this.filteredSignals = this.signals.filter((signal) => {
      const byCompetitor = this.selectedCompetitor === 'all' || signal.competitorId === this.selectedCompetitor;
      const byAgent = this.selectedAgent === 'all' || this.normalizeValue(signal.agentType) === this.normalizeValue(this.selectedAgent);
      const bySentiment =
        this.selectedSentiment === 'all' ||
        this.normalizeValue(signal.sentiment ?? 'Neutral') === this.normalizeValue(this.selectedSentiment);

      return byCompetitor && byAgent && bySentiment;
    });

    this.filteredSignalsCount = this.filteredSignals.length;
  }

  private normalizeValue(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private isSelectableDate(date: Date): boolean {
    return date >= this.minSelectableDate && date <= this.today;
  }

  getDateRange(): { from: Date | null; to: Date | null } {
    const now = new Date();
    const today = new Date(now.setHours(23, 59, 59, 999));

    switch (this.selectedDateRange) {
      case 'Last14Days':
        return {
          from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          to: today
        };
      case 'Last30Days':
        return {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: today
        };
      case 'AllTime':
        return {
          from: null,
          to: null
        };
      case 'Custom':
        return {
          from: this.customFromDate ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: this.customToDate ?? today
        };
      case 'Last7Days':
      default:
        return {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: today
        };
    }
  }

  getSentimentSeverity(sentiment: string | null | undefined): 'success' | 'danger' | 'secondary' {
    switch (sentiment) {
      case 'Positive':
        return 'success';
      case 'Negative':
        return 'danger';
      default:
        return 'secondary';
    }
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
