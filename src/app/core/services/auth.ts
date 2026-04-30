import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserRole } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = environment.apiUrl + '/auth';

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(
    this.getUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private getUserFromStorage(): LoginResponse | null {
    const user = localStorage.getItem('rivalradar_user');
    return user ? JSON.parse(user) : null;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(response => {
          localStorage.setItem('rivalradar_token', response.token);
          localStorage.setItem('rivalradar_user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, request)
      .pipe(
        tap(response => {
          localStorage.setItem('rivalradar_token', response.token);
          localStorage.setItem('rivalradar_user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('rivalradar_token');
    localStorage.removeItem('rivalradar_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('rivalradar_token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('rivalradar_token');
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.Admin;
  }
}

