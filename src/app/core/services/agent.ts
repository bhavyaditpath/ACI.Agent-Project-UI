import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentRunLog } from '../models/agent-run-log.model';
import { AgentRunRequest } from '../models/agent.model';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly basePath = `${environment.apiUrl}/agents`;

  runAll(request?: AgentRunRequest): Observable<unknown> {
    return this.http.post(`${this.basePath}/run`, request ?? { dateRangeType: 'Last7Days' }).pipe(timeout(300000));
  }

  runForCompetitor(competitorId: string, request?: AgentRunRequest): Observable<unknown> {
    return this.http
      .post(`${this.basePath}/run/${competitorId}`, request ?? { dateRangeType: 'Last7Days' })
      .pipe(timeout(300000));
  }

  getLogs(): Observable<AgentRunLog[]> {
    return this.http.get<AgentRunLog[]>(`${this.basePath}/logs`);
  }
}
