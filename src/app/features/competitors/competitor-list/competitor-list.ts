import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, finalize, startWith, switchMap } from 'rxjs';
import { TimeoutError } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CompetitorService } from '../../../core/services/competitor';
import { AgentService } from '../../../core/services/agent';
import { Auth } from '../../../core/services/auth';
import { Competitor } from '../../../core/models/competitor.model';

const WEBSITE_URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\:[0-9]+)?(\/[^\s]*)?$/i;

@Component({
  selector: 'app-competitor-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './competitor-list.html',
  styleUrl: './competitor-list.css',
})
export class CompetitorListComponent {
  private readonly competitorService = inject(CompetitorService);
  private readonly agentService = inject(AgentService);
  private readonly authService = inject(Auth);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  private readonly reloadCompetitors$ = new Subject<void>();
  readonly competitors$ = this.reloadCompetitors$.pipe(
    startWith(undefined),
    switchMap(() => this.competitorService.getAll())
  );
  dialogVisible = false;
  saving = false;
  selectedId: string | null = null;
  runningCompetitors = new Set<string>();
  deleteDialogVisible = false;
  competitorToDelete: Competitor | null = null;

  readonly competitorForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    websiteUrl: ['', [Validators.required, Validators.pattern(WEBSITE_URL_PATTERN)]],
    description: ['']
  });

  get nameControl() {
    return this.competitorForm.controls.name;
  }

  get websiteUrlControl() {
    return this.competitorForm.controls.websiteUrl;
  }

  get isEditMode(): boolean {
    return this.selectedId !== null;
  }

  loadCompetitors(): void {
    this.reloadCompetitors$.next();
  }

  openCreateDialog(): void {
    this.selectedId = null;
    this.competitorForm.reset({ name: '', websiteUrl: '', description: '' });
    this.dialogVisible = true;
  }

  openEditDialog(competitor: Competitor): void {
    this.selectedId = competitor.id;
    this.competitorForm.reset({
      name: competitor.name,
      websiteUrl: competitor.websiteUrl,
      description: competitor.description ?? ''
    });
    this.dialogVisible = true;
  }

  saveCompetitor(): void {
    if (this.competitorForm.invalid || this.saving) {
      this.competitorForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.competitorForm.value.name ?? '',
      websiteUrl: this.competitorForm.value.websiteUrl ?? '',
      description: this.competitorForm.value.description ?? ''
    };

    this.saving = true;
    const request$ = this.selectedId
      ? this.competitorService.update(this.selectedId, payload)
      : this.competitorService.create(payload);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.dialogVisible = false;
        this.loadCompetitors();
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: this.selectedId ? 'Competitor updated.' : 'Competitor created.',
          life: 3000
        });
      },
      error: (error) => {
        const errorMessage = this.getCompetitorErrorMessage(error);
        this.messageService.add({
          severity: errorMessage === 'Failed to save competitor.' ? 'error' : 'warn',
          summary: errorMessage === 'Failed to save competitor.' ? 'Error' : 'Validation',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  private getCompetitorErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const responseMessage = this.extractResponseMessage(error.error);
      return responseMessage || error.message || 'Failed to save competitor.';
    }

    return 'Failed to save competitor.';
  }

  private extractResponseMessage(payload: unknown): string {
    if (!payload || typeof payload !== 'object') {
      return '';
    }

    const typedPayload = payload as { message?: unknown };
    return typeof typedPayload.message === 'string' ? typedPayload.message : '';
  }

  runAgentsForCompetitor(competitorId: string, competitorName: string): void {
    this.runningCompetitors.add(competitorId);

    this.messageService.add({
      severity: 'info',
      summary: 'Agents Started',
      detail: `Running all agents for ${competitorName}...`,
      life: 3000
    });

    this.agentService.runForCompetitor(competitorId).subscribe({
      next: () => {
        this.runningCompetitors.delete(competitorId);
        this.messageService.add({
          severity: 'success',
          summary: 'Agents Completed',
          detail: `All agents finished for ${competitorName}`,
          life: 4000
        });
      },
      error: (err) => {
        this.runningCompetitors.delete(competitorId);
        if (err instanceof TimeoutError) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Still Running',
            detail: `Agents for ${competitorName} are still running in the background. Check Agent Logs for status.`,
            life: 6000
          });
          return;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Agent Run Failed',
          detail: `Something went wrong for ${competitorName}. Check Agent Logs.`,
          life: 5000
        });
      }
    });
  }

  isRunning(competitorId: string): boolean {
    return this.runningCompetitors.has(competitorId);
  }

  confirmDelete(competitor: Competitor): void {
    this.competitorToDelete = competitor;
    this.deleteDialogVisible = true;
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.competitorToDelete = null;
  }

  deleteCompetitor(): void {
    if (!this.competitorToDelete) {
      return;
    }

    const competitor = this.competitorToDelete;
    this.competitorService.delete(competitor.id).subscribe({
      next: () => {
        this.deleteDialogVisible = false;
        this.competitorToDelete = null;
        this.loadCompetitors();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Competitor deleted successfully.',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete competitor.',
          life: 5000
        });
      }
    });
  }

  truncateDescription(text?: string): string {
    if (!text) {
      return '-';
    }

    if (text.length <= 50) {
      return text;
    }

    return `${text.slice(0, 50)}...`;
  }
}
