import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatMenuModule,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-5xl">
        <!-- User Menu -->
        <div class="absolute top-4 right-4">
          <button
            mat-icon-button
            [matMenuTriggerFor]="userMenu"
            class="bg-white shadow-md"
          >
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="px-4 py-2 border-b">
              <div class="text-sm font-medium text-gray-900">
                {{ authService.userDisplayName() }}
              </div>
              <div class="text-xs text-gray-500">
                {{ authService.currentUser()?.email }}
              </div>
            </div>
            <button mat-menu-item (click)="signOut()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Budget Planner! 💰
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's set up your personalized budget in just a few simple steps.
            We'll help you track your income, categorize expenses, and achieve
            your financial goals.
          </p>
        </div>

        <mat-card class="p-8 shadow-xl">
          <mat-card-content>
            <div class="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 class="text-3xl font-semibold mb-6 text-gray-800">
                  🚀 Get Started in 5 Easy Steps
                </h2>

                <div class="space-y-6">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-blue-600">1</span>
                    </div>
                    <span class="text-lg text-gray-700"
                      >Tell us about yourself</span
                    >
                  </div>

                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-green-600">2</span>
                    </div>
                    <span class="text-lg text-gray-700"
                      >Set up your income sources</span
                    >
                  </div>

                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-yellow-600">3</span>
                    </div>
                    <span class="text-lg text-gray-700"
                      >Choose your expense categories</span
                    >
                  </div>

                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-purple-600">4</span>
                    </div>
                    <span class="text-lg text-gray-700"
                      >Set your budget limits</span
                    >
                  </div>

                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-pink-600">5</span>
                    </div>
                    <span class="text-lg text-gray-700"
                      >Review and confirm</span
                    >
                  </div>
                </div>
              </div>

              <div class="text-center">
                <div class="text-8xl mb-8">📊</div>
                <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                  Take control of your finances with our modern, signal-powered
                  budget tracking system built with Angular 20.
                </p>

                <button
                  mat-raised-button
                  color="primary"
                  class="text-xl px-10 py-4 font-medium"
                  routerLink="/dashboard"
                >
                  <mat-icon class="mr-3 text-2xl">arrow_forward</mat-icon>
                  Start Setup
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="mt-10 grid md:grid-cols-3 gap-8">
          <div
            class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <mat-icon class="text-5xl text-blue-500 mb-4">trending_up</mat-icon>
            <h3 class="text-lg font-semibold mb-3">Real-time Tracking</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Monitor your spending with live updates using Angular Signals
            </p>
          </div>

          <div
            class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <mat-icon class="text-5xl text-green-500 mb-4">security</mat-icon>
            <h3 class="text-lg font-semibold mb-3">Secure & Private</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Your data stays on your device with local storage
            </p>
          </div>

          <div
            class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <mat-icon class="text-5xl text-purple-500 mb-4">insights</mat-icon>
            <h3 class="text-lg font-semibold mb-3">Smart Insights</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Get actionable insights about your spending patterns
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {
  readonly authService = inject(AuthService);

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
