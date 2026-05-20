import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { SettingsService } from '../../../core/services/settings.service';
import {
  GlobalAgentDefaultResponse,
  UpdateAllGlobalDefaultsRequest
} from '../../../core/models/settings.model';

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, ToastModule, TagModule, SkeletonModule, MessageModule, ToggleSwitch],
  providers: [MessageService],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  agentDefaults: GlobalAgentDefaultResponse[] = [];
  isLoading = true;
  isSaving = false;
  hasUnsavedChanges = false;
  originalDefaults: Map<string, boolean> = new Map();

  ngOnInit(): void {
    this.loadDefaults();
  }

  loadDefaults(): void {
    this.isLoading = true;
    this.settingsService.getAgentDefaults().subscribe({
      next: (data) => {
        this.agentDefaults = data;
        this.originalDefaults.clear();
        data.forEach((defaultItem) => {
          this.originalDefaults.set(defaultItem.agentType, defaultItem.isEnabledByDefault);
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load settings',
          life: 3000
        });
        this.cdr.detectChanges();
      }
    });
  }

  onToggleChange(): void {
    this.hasUnsavedChanges = this.agentDefaults.some(
      (agent) => agent.isEnabledByDefault !== this.originalDefaults.get(agent.agentType)
    );
  }

  cancelChanges(): void {
    this.agentDefaults.forEach((agent) => {
      const originalValue = this.originalDefaults.get(agent.agentType);
      if (typeof originalValue === 'boolean') {
        agent.isEnabledByDefault = originalValue;
      }
    });

    this.hasUnsavedChanges = false;
    this.cdr.detectChanges();
  }

  saveAllSettings(): void {
    this.isSaving = true;

    const request: UpdateAllGlobalDefaultsRequest = {
      agents: this.agentDefaults.map((agent) => ({
        agentType: agent.agentType,
        isEnabledByDefault: agent.isEnabledByDefault
      }))
    };

    this.settingsService.saveAllDefaults(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.hasUnsavedChanges = false;
        this.agentDefaults.forEach((agent) => {
          this.originalDefaults.set(agent.agentType, agent.isEnabledByDefault);
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Settings Saved',
          detail: 'Default agent configuration saved successfully',
          life: 3000
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Failed to save settings. Please try again.',
          life: 4000
        });
        this.cdr.detectChanges();
      }
    });
  }

  resetToDefaults(): void {
    this.agentDefaults.forEach((agent) => {
      agent.isEnabledByDefault = true;
    });
    this.onToggleChange();
    this.cdr.detectChanges();
  }
}