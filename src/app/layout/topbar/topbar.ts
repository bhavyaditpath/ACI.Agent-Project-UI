import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeoutError } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { AgentService } from '../../core/services/agent';
import { Auth } from '../../core/services/auth';
import { AgentDateRangeType, AgentRunRequest } from '../../core/models/agent.model';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, FormsModule, ToolbarModule, ButtonModule, DialogModule, ToastModule, TagModule, TooltipModule, SelectModule, DatePickerModule],
  providers: [MessageService],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  private readonly agentService = inject(AgentService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(Auth);

  readonly isDrawerOpen = input(false);
  readonly menuToggle = output<void>();

  runningAll = false;
  showRunAllDialog = false;
  selectedDateRange: AgentDateRangeType = 'Last7Days';
  customFromDate: Date | null = null;
  customToDate: Date | null = null;
  today = new Date();
  readonly dateRangeOptions: Array<{ label: string; value: AgentDateRangeType }> = [
    { label: 'Last 7 Days', value: 'Last7Days' },
    { label: 'Last 30 Days', value: 'Last30Days' },
    { label: 'Custom Range', value: 'Custom' }
  ];

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openRunAllDialog(): void {
    this.selectedDateRange = 'Last7Days';
    this.customFromDate = null;
    this.customToDate = null;
    this.showRunAllDialog = true;
  }

  confirmRunAll(): void {
    this.showRunAllDialog = false;

    const request: AgentRunRequest = {
      dateRangeType: this.selectedDateRange,
      fromDate: this.selectedDateRange === 'Custom' ? this.customFromDate?.toISOString() : undefined,
      toDate: this.selectedDateRange === 'Custom' ? this.customToDate?.toISOString() : undefined
    };

    this.runAllAgents(request);
  }

  runAllAgents(request?: AgentRunRequest): void {
    if (this.runningAll) {
      return;
    }

    this.runningAll = true;

    this.messageService.add({
      severity: 'info',
      summary: 'All Agents Started',
      detail: request ? `Running agents for all competitors — ${request.dateRangeType}...` : 'Running agents for all competitors...',
      life: 3000
    });

    this.agentService.runAll(request).subscribe({
      next: () => {
        this.runningAll = false;
        this.messageService.add({
          severity: 'success',
          summary: 'All Agents Completed',
          detail: 'Agents finished for all competitors.',
          life: 4000
        });
      },
      error: (err) => {
        this.runningAll = false;
        if (err instanceof TimeoutError) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Still Running',
            detail: 'Agents are still running in background. Check Agent Logs page for live status.',
            life: 6000
          });
          return;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Something went wrong. Check Agent Logs for details.',
          life: 5000
        });
      }
    });
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }
}

