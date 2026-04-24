import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Signal } from '../models/signal.model';

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  private readonly http = inject(HttpClient);
  private readonly basePath = `${environment.apiUrl}/signals`;

  getRecent(days = 7): Observable<Signal[]> {
    return this.http.get<Signal[]>(`${this.basePath}?days=${days}`);
  }

  getByCompetitor(competitorId: string): Observable<Signal[]> {
    return this.http.get<Signal[]>(`${this.basePath}/competitor/${competitorId}`);
  }
}
