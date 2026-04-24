import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeeklyReport, WeeklyReportRequest } from '../models/weekly-report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly basePath = `${environment.apiUrl}/reports`;

  generate(request: WeeklyReportRequest): Observable<WeeklyReport> {
    return this.http.post<WeeklyReport>(`${this.basePath}/generate`, request);
  }

  generateAll(): Observable<unknown> {
    return this.http.post(`${this.basePath}/generate-all`, {});
  }

  getAll(): Observable<WeeklyReport[]> {
    return this.http.get<WeeklyReport[]>(this.basePath);
  }

  getByCompetitor(competitorId: string): Observable<WeeklyReport[]> {
    return this.http.get<WeeklyReport[]>(`${this.basePath}/competitor/${competitorId}`);
  }
}
