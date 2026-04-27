import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { AgentService } from '../../core/services/agent';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, ToolbarModule, ButtonModule, ToastModule, TagModule],
  providers: [MessageService],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  private readonly agentService = inject(AgentService);
  private readonly messageService = inject(MessageService);

  readonly isDrawerOpen = input(false);
  readonly menuToggle = output<void>();

  runningAll = false;

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
}
