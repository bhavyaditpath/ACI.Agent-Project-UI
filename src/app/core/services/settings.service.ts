import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GlobalAgentDefaultResponse,
  UpdateAllGlobalDefaultsRequest,
  UpdateGlobalAgentDefaultRequest
} from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/settings`;

  getAgentDefaults(): Observable<GlobalAgentDefaultResponse[]> {
    return this.http.get<GlobalAgentDefaultResponse[]>(`${this.baseUrl}/agents/defaults`);
  }

  updateAgentDefault(request: UpdateGlobalAgentDefaultRequest): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/agents/defaults`, request, { responseType: 'text' as 'json' });
  }

  saveAllDefaults(request: UpdateAllGlobalDefaultsRequest): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/agents/defaults/all`, request, { responseType: 'text' as 'json' });
  }
}