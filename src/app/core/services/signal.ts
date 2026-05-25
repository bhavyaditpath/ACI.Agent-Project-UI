import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Signal } from '../models/signal.model';

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  private readonly http = inject(HttpClient);
  private readonly basePath = `${environment.apiUrl}/signals`;

  getSignals(
    fromDate?: string,
    toDate?: string,
    allTime = false,
    competitorId?: string,
    agentType?: string,
    sentiment?: string
  ): Observable<Signal[]> {
    let params = new HttpParams();

    if (allTime) {
      params = params.set('allTime', 'true');
    }

    if (fromDate && toDate) {
      params = params
        .set('fromDate', fromDate)
        .set('toDate', toDate);
    }

    if (competitorId && competitorId !== 'all') {
      params = params.set('competitorId', competitorId);
    }

    if (agentType && agentType !== 'all') {
      params = params.set('agentType', agentType);
    }

    if (sentiment && sentiment !== 'all') {
      params = params.set('sentiment', sentiment);
    }

    return this.http.get<Signal[]>(this.basePath, { params });
  }

  getByCompetitor(competitorId: string): Observable<Signal[]> {
    return this.http.get<Signal[]>(`${this.basePath}/competitor/${competitorId}`);
  }
}
