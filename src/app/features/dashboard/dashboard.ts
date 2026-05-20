import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageService } from 'primeng/api';
import { AnalyticsService, DashboardAnalyticsResponse } from '../../core/services/analytics';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, CardModule, TableModule, TagModule, ButtonModule, SkeletonModule, ToastModule, ChartModule, ProgressBarModule, ScrollPanelModule, MessageModule],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  analytics: DashboardAnalyticsResponse | null = null;
  isLoading = true;

  sentimentChartData: any = {};
  sentimentChartOptions: any = {};
  agentChartData: any = {};
  agentChartOptions: any = {};

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
        this.buildChartData();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load dashboard data.',
          life: 5000
        });
        this.cdr.detectChanges();
      }
    });
  }

  buildChartData(): void {
    if (!this.analytics) return;

    const dist = this.analytics.sentimentDistribution;

    // Sentiment Pie Chart data
    this.sentimentChartData = {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [
        {
          data: [dist.positive, dist.negative, dist.neutral],
          backgroundColor: ['#22C55E', '#EF4444', '#94A3B8']
        }
      ]
    };

    this.sentimentChartOptions = {
      plugins: {
        legend: { position: 'bottom' }
      }
    };

    // Signals by Agent Bar Chart
    const agents = this.analytics.signalsByAgent;
    this.agentChartData = {
      labels: agents.map((a) => a.agentType),
      datasets: [
        {
          label: 'Signals',
          data: agents.map((a) => a.count),
          backgroundColor: '#2563EB'
        }
      ]
    };

    this.agentChartOptions = {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }



  getMentionPercentage(count: number): number {
    if (!this.analytics?.trendingTopics?.length) return 0;
    const max = Math.max(
      ...this.analytics.trendingTopics.map((t) => t.mentionCount)
    );
    if (max === 0) return 0;
    return Math.round((count / max) * 100);
  }

  runAllAgents(): void {
    // To be implemented when needed
  }

  generateReports(): void {
    // To be implemented when needed
  }

  viewSignals(): void {
    this.router.navigate(['/signals']);
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }

  getImportanceSeverity(score: number): 'info' | 'warn' | 'danger' {
    if (score >= 3) {
      return 'danger';
    }

    if (score === 2) {
      return 'warn';
    }

    return 'info';
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    const normalized = status.toLowerCase();
    if (normalized === 'completed') {
      return 'success';
    }

    if (normalized === 'failed') {
      return 'danger';
    }

    if (normalized === 'running') {
      return 'warn';
    }

    return 'info';
  }

  getDuration(log: any): string {
    if (!log.completedAt) {
      return 'Running...';
    }

    const seconds = Math.max(
      0,
      Math.floor(
        (new Date(log.completedAt).getTime() -
          new Date(log.startedAt).getTime()) /
          1000
      )
    );

    return `${seconds}s`;
  }
}
