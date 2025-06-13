import { Routes } from '@angular/router';
import { guestOnlyGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./sign-in.component').then((m) => m.SignInComponent),
    canActivate: [guestOnlyGuard],
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./sign-up.component').then((m) => m.SignUpComponent),
    canActivate: [guestOnlyGuard],
  },
];
