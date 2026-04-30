import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CompetitorService } from '../../core/services/competitor';
import { SignalService } from '../../core/services/signal';
import { AgentService } from '../../core/services/agent';
import { ReportService } from '../../core/services/report';
import { Competitor } from '../../core/models/competitor.model';
import { Signal } from '../../core/models/signal.model';
import { AgentRunLog } from '../../core/models/agent-run-log.model';
import { WeeklyReport } from '../../core/models/weekly-report.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, CardModule, TableModule, TagModule, ButtonModule, SkeletonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly competitorService = inject(CompetitorService);
  private readonly signalService = inject(SignalService);
  private readonly agentService = inject(AgentService);
  private readonly reportService = inject(ReportService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = true;
  competitors: Competitor[] = [];
  signals: Signal[] = [];
  logs: AgentRunLog[] = [];
  reports: WeeklyReport[] = [];
  recentSignals: Signal[] = [];
  recentLogs: AgentRunLog[] = [];

  totalCompetitors = 0;
  signalsThisWeek = 0;
  agentRunsToday = 0;
  reportsGenerated = 0;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    forkJoin({
      competitors: this.competitorService.getAll(),
      signals: this.signalService.getRecent(7),
      logs: this.agentService.getLogs(),
      reports: this.reportService.getAll()
    }).subscribe({
      next: ({ competitors, signals, logs, reports }) => {
        this.competitors = competitors;
        this.signals = signals;
        this.logs = logs;
        this.reports = reports;

        this.recentSignals = signals.slice(0, 5);
        this.recentLogs = logs.slice(0, 5);

        this.totalCompetitors = competitors.length;
        this.signalsThisWeek = signals.length;

        const today = new Date().toDateString();
        this.agentRunsToday = logs.filter((log) => new Date(log.startedAt).toDateString() === today).length;
        this.reportsGenerated = reports.length;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
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

  runAllAgents(): void {
    this.agentService.runAll().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Agents Started',
          detail: 'All agents have been started.',
          life: 3000
        });
        this.loadDashboard();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to start agents.',
          life: 5000
        });
      }
    });
  }

  generateReports(): void {
    this.reportService.generateAll().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Reports Generated',
          detail: 'All reports have been generated.',
          life: 3000
        });
        this.loadDashboard();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate reports.',
          life: 5000
        });
      }
    });
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

  getDuration(log: AgentRunLog): string {
    if (!log.completedAt) {
      return 'Running...';
    }

    const seconds = Math.max(
      0,
      Math.floor((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
    );

    return `${seconds}s`;
  }
}
