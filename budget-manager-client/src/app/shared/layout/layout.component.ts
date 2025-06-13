import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <mat-toolbar class="bg-white shadow-sm border-b">
        <button
          mat-icon-button
          (click)="sidenavOpen.set(!sidenavOpen())"
          class="mr-4"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <span class="text-xl font-semibold text-gray-800">
          💰 Budget Planner
        </span>

        <div class="flex-1"></div>

        <div class="flex items-center gap-4">
          @if (user()) {
            <div class="flex items-center gap-4">
              <div class="text-sm text-gray-600">
                Welcome, {{ authService.userDisplayName() }}!
              </div>
              <div class="text-sm font-medium text-green-600">
                {{ user()?.currency || '$' }}
                {{ totalIncome() | number: '1.0-0' }}/month
              </div>
            </div>
          }

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/onboarding">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="signOut()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <mat-sidenav-container class="min-h-[calc(100vh-64px)]">
        <mat-sidenav
          [opened]="sidenavOpen()"
          [mode]="'side'"
          class="w-64 bg-white border-r"
        >
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>

            <mat-nav-list>
              @for (item of navItems; track item.path) {
                <a
                  mat-list-item
                  [routerLink]="item.path"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="mb-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <mat-icon matListItemIcon class="text-gray-600">
                    {{ item.icon }}
                  </mat-icon>

                  <span matListItemTitle class="font-medium">
                    {{ item.label }}
                  </span>

                  @if (item.badge && item.badge > 0) {
                    <span
                      matListItemMeta
                      matBadge="{{ item.badge }}"
                      matBadgeColor="primary"
                      matBadgeSize="small"
                    >
                    </span>
                  }
                </a>
              }
            </mat-nav-list>
          </div>

          <div class="absolute bottom-4 left-4 right-4">
            <button
              mat-button
              color="warn"
              (click)="clearAllData()"
              class="w-full"
            >
              <mat-icon>delete_forever</mat-icon>
              Clear All Data
            </button>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="p-6">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly budgetService = inject(BudgetService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidenavOpen = signal(true);

  // Reactive data from services
  readonly user = this.budgetService.user;
  readonly totalIncome = this.budgetService.totalMonthlyIncome;
  readonly transactions = this.budgetService.transactions;

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Transactions',
      path: '/transactions',
      icon: 'receipt_long',
      badge: this.transactions().length,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: 'analytics',
    },
  ];

  clearAllData(): void {
    if (
      confirm(
        'Are you sure you want to clear all data? This action cannot be undone.',
      )
    ) {
      this.budgetService.clearData();
      this.router.navigate(['/onboarding']);
    }
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
