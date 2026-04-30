import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, interval, Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AgentService } from '../../../core/services/agent';
import { Auth } from '../../../core/services/auth';
import { AgentRunLog } from '../../../core/models/agent-run-log.model';

@Component({
  selector: 'app-agent-logs',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    CardModule,
    SelectModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './agent-logs.html',
  styleUrl: './agent-logs.css',
})
export class AgentLogsComponent implements OnInit, OnDestroy {
  private readonly agentService = inject(AgentService);
  private readonly authService = inject(Auth);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private refreshSubscription?: Subscription;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logs: AgentRunLog[] = [];
  filteredLogs: AgentRunLog[] = [];
  runningAll = false;
  totalRuns = 0;
  completedCount = 0;
  failedCount = 0;
  totalSignalsCollected = 0;

  readonly statusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Running', value: 'Running' }
  ];

  readonly agentOptions = [
    { label: 'All', value: 'All' },
    { label: 'WebWatcher', value: 'WebWatcher' },
    { label: 'JobBoard', value: 'JobBoard' },
    { label: 'RssFeed', value: 'RssFeed' },
    { label: 'Reddit', value: 'Reddit' },
    { label: 'HackerNews', value: 'HackerNews' }
  ];

  selectedStatus = 'All';
  selectedAgent = 'All';

  ngOnInit(): void {
    this.loadLogs();
    this.refreshSubscription = interval(30000).subscribe(() => this.loadLogs());
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onAgentChange(): void {
    this.applyFilters();
  }

  loadLogs(): void {
    this.agentService.getLogs().subscribe((logs) => {
      this.logs = logs;
      this.updateSummary();
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  private updateSummary(): void {
    this.totalRuns = this.logs.length;
    this.completedCount = this.logs.filter((log) => log.status === 'Completed').length;
    this.failedCount = this.logs.filter((log) => log.status === 'Failed').length;
    this.totalSignalsCollected = this.logs.reduce((sum, log) => sum + log.signalsCollected, 0);
  }

  private applyFilters(): void {
    this.filteredLogs = this.logs.filter((log) => {
      const statusMatch = this.selectedStatus === 'All' || log.status === this.selectedStatus;
      const agentMatch = this.selectedAgent === 'All' || log.agentType === this.selectedAgent;
      return statusMatch && agentMatch;
    });
  }

  runAllAgents(): void {
    if (this.runningAll) {
      return;
    }

    this.runningAll = true;
    this.agentService
      .runAll()
      .pipe(finalize(() => (this.runningAll = false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Agents Started',
            detail: 'All agents have been started.',
            life: 3000
          });
          this.loadLogs();
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

  refresh(): void {
    this.loadLogs();
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    if (status === 'Completed') {
      return 'success';
    }

    if (status === 'Failed') {
      return 'danger';
    }

    if (status === 'Running') {
      return 'warn';
    }

    return 'info';
  }

  getAgentIcon(agentType: string): string {
    switch (agentType) {
      case 'WebWatcher':
        return 'pi pi-globe';
      case 'JobBoard':
        return 'pi pi-briefcase';
      case 'RssFeed':
        return 'pi pi-wifi';
      case 'Reddit':
        return 'pi pi-comments';
      case 'HackerNews':
        return 'pi pi-code';
      default:
        return 'pi pi-server';
    }
  }

  getDuration(log: AgentRunLog): string {
    if (!log.completedAt) {
      return 'Running...';
    }

    const duration =
      (new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000;
    return `${Math.max(0, Math.floor(duration))}s`;
  }

  truncateError(errorMessage?: string): string {
    if (!errorMessage) {
      return '-';
    }

    if (errorMessage.length <= 40) {
      return errorMessage;
    }

    return `${errorMessage.slice(0, 40)}...`;
  }
}
