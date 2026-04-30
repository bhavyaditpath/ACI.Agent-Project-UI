import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
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
    this.agentService
      .runAll()
      .pipe(finalize(() => (this.runningAll = false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Agents Started',
            detail: 'All agents were started successfully.'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Run Failed',
            detail: 'Unable to run agents right now.'
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

