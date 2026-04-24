import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Competitor, CompetitorCreateRequest } from '../models/competitor.model';

@Injectable({
  providedIn: 'root',
})
export class CompetitorService {
  private readonly http = inject(HttpClient);
  private readonly basePath = `${environment.apiUrl}/competitors`;

  getAll(): Observable<Competitor[]> {
    return this.http.get<Competitor[]>(this.basePath);
  }

  getById(id: string): Observable<Competitor> {
    return this.http.get<Competitor>(`${this.basePath}/${id}`);
  }

  create(request: CompetitorCreateRequest): Observable<Competitor> {
    return this.http.post<Competitor>(this.basePath, request);
  }

  update(id: string, request: CompetitorCreateRequest): Observable<Competitor> {
    return this.http.put<Competitor>(`${this.basePath}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }
}
