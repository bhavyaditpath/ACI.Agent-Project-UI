import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeoutError } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AgentService } from '../../core/services/agent';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, ToolbarModule, ButtonModule, ToastModule, TagModule, TooltipModule],
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

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  runAllAgents(): void {
    if (this.runningAll) {
      return;
    }

    this.runningAll = true;

    this.messageService.add({
      severity: 'info',
      summary: 'All Agents Started',
      detail: 'Running agents for all competitors...',
      life: 3000
    });

    this.agentService.runAll().subscribe({
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

