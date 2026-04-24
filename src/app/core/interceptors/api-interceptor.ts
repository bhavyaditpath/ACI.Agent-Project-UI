import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsoluteUrl = /^https?:\/\//i.test(req.url);
  const normalizedUrl = isAbsoluteUrl
    ? req.url
    : `${environment.apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;

  const clonedRequest = req.clone({
    url: normalizedUrl,
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  if (!environment.production) {
    console.log('[API]', clonedRequest.method, clonedRequest.url);
  }

  return next(clonedRequest);
};
