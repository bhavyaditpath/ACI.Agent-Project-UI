import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReportService } from '../../../core/services/report';
import { CompetitorService } from '../../../core/services/competitor';
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
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  reports: WeeklyReport[] = [];
  reportCount = 0;
  competitors: Competitor[] = [];
  competitorOptions: Array<{ label: string; value: string }> = [];

  dialogVisible = false;
  generatingAll = false;
  generatingSingle = false;

  selectedCompetitorId = '';
  weekStartDate: Date | null = null;
  weekEndDate: Date | null = null;

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    forkJoin({ reports: this.reportService.getAll(), competitors: this.competitorService.getAll() }).subscribe(
      ({ reports, competitors }) => {
        this.reports = reports;
        this.reportCount = reports.length;
        this.competitors = competitors;
        this.competitorOptions = competitors.map((c) => ({ label: c.name, value: c.id }));
        this.cdr.detectChanges();
      }
    );
  }

  openGenerateDialog(): void {
    this.dialogVisible = true;
  }

  generateAll(): void {
    if (this.generatingAll) {
      return;
    }

    this.generatingAll = true;
    this.reportService
      .generateAll()
      .pipe(finalize(() => (this.generatingAll = false)))
      .subscribe(() => {
        this.loadPageData();
        this.messageService.add({
          severity: 'success',
          summary: 'Reports Generated',
          detail: 'All competitor reports generated successfully.'
        });
      });
  }

  generateReport(): void {
    if (
      !this.selectedCompetitorId ||
      !this.weekStartDate ||
      !this.weekEndDate ||
      this.generatingSingle
    ) {
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
      .subscribe(() => {
        this.dialogVisible = false;
        this.loadPageData();
        this.messageService.add({
          severity: 'success',
          summary: 'Report Generated',
          detail: 'Weekly report generated successfully.'
        });
      });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
