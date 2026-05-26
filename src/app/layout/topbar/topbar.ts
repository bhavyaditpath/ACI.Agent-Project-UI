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
  readonly minSelectableDate = new Date(2010, 0, 1);

  runningAll = false;
  showRunAllDialog = false;
  selectedDateRange: AgentDateRangeType = 'Last7Days';
  customFromDate: Date | null = null;
  customToDate: Date | null = null;
  customDateRangeTouched = false;
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

  get canRunAllAgents(): boolean {
    if (this.selectedDateRange !== 'Custom') {
      return true;
    }

    return !!this.customFromDate && !!this.customToDate && !this.isCustomDateRangeInvalid;
  }

  get customDateRangeMessage(): string | null {
    if (this.selectedDateRange !== 'Custom') {
      return null;
    }

    if (!this.customDateRangeTouched) {
      return null;
    }

    if (!this.customFromDate || !this.customToDate) {
      return 'Select both From Date and To Date before running agents.';
    }

    if (this.isCustomDateRangeInvalid) {
      return 'Select dates between Jan 1, 2010 and today, and keep To Date on or after From Date.';
    }

    return null;
  }

  openRunAllDialog(): void {
    this.selectedDateRange = 'Last7Days';
    this.customFromDate = null;
    this.customToDate = null;
    this.customDateRangeTouched = false;
    this.showRunAllDialog = true;
  }

  onCustomDateRangeTouched(): void {
    this.customDateRangeTouched = true;
  }

  confirmRunAll(): void {
    if (this.selectedDateRange === 'Custom') {
      if (!this.customFromDate || !this.customToDate) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Incomplete Date Range',
          detail: 'Select both From Date and To Date before running agents.',
          life: 4000
        });
        return;
      }

      if (this.isCustomDateRangeInvalid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Date Range',
          detail: 'Select dates between Jan 1, 2010 and today, and keep To Date on or after From Date.',
          life: 5000
        });
        return;
      }
    }

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

  private isSelectableDate(date: Date): boolean {
    return date >= this.minSelectableDate && date <= this.today;
  }

  onLogout(): void {
    this.authService.logout();
  }
}

