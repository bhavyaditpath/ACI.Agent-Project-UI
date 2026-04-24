import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompetitorService } from '../../../core/services/competitor';
import { AgentService } from '../../../core/services/agent';
import { Competitor } from '../../../core/models/competitor.model';

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
    ConfirmDialogModule,
    TagModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './competitor-list.html',
  styleUrl: './competitor-list.css',
})
export class CompetitorListComponent implements OnInit {
  private readonly competitorService = inject(CompetitorService);
  private readonly agentService = inject(AgentService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);

  competitors: Competitor[] = [];
  dialogVisible = false;
  saving = false;
  selectedId: string | null = null;

  readonly competitorForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    websiteUrl: ['', [Validators.required]],
    description: ['']
  });

  ngOnInit(): void {
    this.loadCompetitors();
  }

  get isEditMode(): boolean {
    return this.selectedId !== null;
  }

  loadCompetitors(): void {
    this.competitorService.getAll().subscribe((data) => {
      this.competitors = data;
    });
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

    request$.pipe(finalize(() => (this.saving = false))).subscribe(() => {
      this.dialogVisible = false;
      this.loadCompetitors();
      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: this.selectedId ? 'Competitor updated.' : 'Competitor created.'
      });
    });
  }

  runAgents(competitor: Competitor): void {
    this.agentService.runForCompetitor(competitor.id).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Agent Run Started',
        detail: `Agents started for ${competitor.name}.`
      });
    });
  }

  confirmDelete(competitor: Competitor): void {
    this.confirmationService.confirm({
      message: `Delete ${competitor.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.competitorService.delete(competitor.id).subscribe(() => {
          this.loadCompetitors();
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Competitor deleted successfully.'
          });
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
