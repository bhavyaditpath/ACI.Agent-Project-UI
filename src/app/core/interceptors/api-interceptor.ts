import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const isAbsoluteUrl = /^https?:\/\//i.test(req.url);
  const normalizedUrl = isAbsoluteUrl
    ? req.url
    : `${environment.apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;

  const token = authService.getToken();

  let clonedRequest = req.clone({
    url: normalizedUrl,
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  if (!environment.production) {
    console.log('[API]', clonedRequest.method, clonedRequest.url);
  }

  return next(clonedRequest).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

