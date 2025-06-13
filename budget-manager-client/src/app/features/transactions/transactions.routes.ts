import { Routes } from '@angular/router';

export const transactionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../placeholder.component').then((m) => m.PlaceholderComponent),
  },
];
