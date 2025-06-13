import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../placeholder.component').then((m) => m.PlaceholderComponent),
  },
];
