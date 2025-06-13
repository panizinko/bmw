import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router, type CanActivateFn } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isLoading).pipe(
    filter((isLoading) => !isLoading),
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/auth']);
      }

      const canAccess = authService.canAccessRoute(state.url);
      if (!canAccess) {
        return router.createUrlTree(['/auth']);
      }

      return true;
    }),
  );
};

export const guestOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isLoading).pipe(
    filter((isLoading) => !isLoading),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        if (authService.hasCompletedOnboarding()) {
          return router.createUrlTree(['/dashboard']);
        } else {
          return router.createUrlTree(['/onboarding']);
        }
      }

      return true;
    }),
  );
};
