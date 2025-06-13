import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { BudgetService } from './core/services/budget.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressSpinnerModule, CommonModule],
  template: `
    @if (authService.isLoading()) {
      <div
        class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center"
      >
        <div class="text-center">
          <mat-spinner diameter="60" class="mx-auto mb-4"></mat-spinner>
          <p class="text-gray-600 text-lg">Loading Budget Planner...</p>
        </div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  standalone: true,
})
export class App implements OnInit {
  private readonly budgetService = inject(BudgetService);
  readonly authService = inject(AuthService);

  async ngOnInit(): Promise<void> {
    this.budgetService.loadFromStorage();
    await this.authService.checkAuthenticationStatus();
  }
}
