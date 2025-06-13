import { Routes } from '@angular/router';

export const reportRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../placeholder.component').then((m) => m.PlaceholderComponent),
  },
];
