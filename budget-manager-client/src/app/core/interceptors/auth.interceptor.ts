import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthHttpService } from '../services/auth-http.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authHttpService = inject(AuthHttpService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const authenticatedReq = req.clone({
    withCredentials: true,
  });

  return next(authenticatedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only attempt refresh for 401 errors on protected routes
      // Don't attempt refresh for auth endpoints themselves
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authHttpService.refreshToken().pipe(
          switchMap((userPublic) => {
            authService.setAuthenticatedUser(userPublic);

            const retryReq = req.clone({ withCredentials: true });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.clearAuth();
            router.navigate(['/auth/sign-in']);
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
