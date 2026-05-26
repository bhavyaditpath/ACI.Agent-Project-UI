import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReportService } from '../../../core/services/report';
import { CompetitorService } from '../../../core/services/competitor';
import { Auth } from '../../../core/services/auth';
import { WeeklyReport } from '../../../core/models/weekly-report.model';
import { Competitor } from '../../../core/models/competitor.model';

@Component({
  selector: 'app-report-viewer',
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './report-viewer.html',
  styleUrl: './report-viewer.css',
})
export class ReportViewerComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly competitorService = inject(CompetitorService);
  private readonly authService = inject(Auth);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly minSelectableDate = new Date(2010, 0, 1);
  readonly today = new Date();

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  reports: WeeklyReport[] = [];
  reportCount = 0;
  competitors: Competitor[] = [];
  competitorOptions: Array<{ label: string; value: string }> = [];
  selectedCompetitor = 'all';

  dialogVisible = false;
  generatingAll = false;
  generatingSingle = false;

  @ViewChild('reportForm') private reportForm?: NgForm;

  selectedCompetitorId = '';
  weekStartDate: Date | null = null;
  weekEndDate: Date | null = null;

  get filteredReports(): WeeklyReport[] {
    if (!this.selectedCompetitor || this.selectedCompetitor === 'all') {
      return this.reports;
    }
    return this.reports.filter((r) => r.competitorId === this.selectedCompetitor);
  }

  get isWeekDateRangeInvalid(): boolean {
    if (!this.weekStartDate || !this.weekEndDate) {
      return false;
    }

    return (
      this.weekStartDate > this.weekEndDate ||
      !this.isSelectableDate(this.weekStartDate) ||
      !this.isSelectableDate(this.weekEndDate)
    );
  }

  get weekStartDateMax(): Date {
    return this.weekEndDate ?? this.today;
  }

  get weekEndDateMin(): Date {
    return this.weekStartDate ?? this.minSelectableDate;
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    forkJoin({ reports: this.reportService.getAll(), competitors: this.competitorService.getAll() }).subscribe(
      ({ reports, competitors }) => {
        this.reports = reports;
        this.reportCount = reports.length;
        this.competitors = competitors;
        this.competitorOptions = [
          { label: 'All Competitors', value: 'all' },
          ...competitors.map((c) => ({ label: c.name, value: c.id }))
        ];
        this.cdr.detectChanges();
      }
    );
  }

  openGenerateDialog(): void {
    this.resetReportForm();
    this.dialogVisible = true;
  }

  resetReportForm(): void {
    this.selectedCompetitorId = '';
    this.weekStartDate = null;
    this.weekEndDate = null;
    this.reportForm?.resetForm({
      competitor: '',
      weekStartDate: null,
      weekEndDate: null
    });
  }

  generateAll(): void {
    if (this.generatingAll) {
      return;
    }

    this.generatingAll = true;
    this.reportService
      .generateAll()
      .pipe(finalize(() => (this.generatingAll = false)))
      .subscribe({
        next: () => {
          this.loadPageData();
          this.messageService.add({
            severity: 'success',
            summary: 'Reports Generated',
            detail: 'All competitor reports generated successfully.',
            life: 3000
          });
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

  generateReport(form: NgForm): void {
    if (
      form.invalid ||
      !this.selectedCompetitorId ||
      !this.weekStartDate ||
      !this.weekEndDate ||
      this.generatingSingle
    ) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.isWeekDateRangeInvalid) {
      form.control.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Date Range',
        detail: 'Select dates between Jan 1, 2010 and today, and keep Week End Date on or after Week Start Date.',
        life: 5000
      });
      return;
    }

    this.generatingSingle = true;
    this.reportService
      .generate({
        competitorId: this.selectedCompetitorId,
        weekStartDate: this.toIsoDate(this.weekStartDate),
        weekEndDate: this.toIsoDate(this.weekEndDate)
      })
      .pipe(finalize(() => (this.generatingSingle = false)))
      .subscribe({
        next: () => {
          this.dialogVisible = false;
          this.loadPageData();
          this.messageService.add({
            severity: 'success',
            summary: 'Report Generated',
            detail: 'Weekly report generated successfully.',
            life: 3000
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to generate report.',
            life: 5000
          });
        }
      });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isSelectableDate(date: Date): boolean {
    return date >= this.minSelectableDate && date <= this.today;
  }
}
