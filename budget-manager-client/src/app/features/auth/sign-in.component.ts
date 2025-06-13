import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ValidationService } from '../../core/services/validation.service';
import { createPasswordVisibility } from '../../core/utils/password-visibility.util';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">💰</div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p class="text-gray-600">Sign in to your Budget Planner account</p>
        </div>

        <!-- Sign In Form -->
        <mat-card class="p-6 shadow-lg">
          <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                />
                <mat-icon matSuffix>email</mat-icon>
                @if (getFieldError('email')) {
                  <mat-error>{{ getFieldError('email') }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="fill" class="w-full">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  matSuffix
                  mat-icon-button
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="
                    showPassword() ? 'Hide password' : 'Show password'
                  "
                >
                  <mat-icon>{{
                    showPassword() ? 'visibility_off' : 'visibility'
                  }}</mat-icon>
                </button>
                @if (getFieldError('password')) {
                  <mat-error>{{ getFieldError('password') }}</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <mat-icon class="text-red-500 mr-2">error</mat-icon>
                    <span class="text-red-700 text-sm">{{
                      errorMessage()
                    }}</span>
                  </div>
                </div>
              }

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full py-3 text-lg font-medium"
                [disabled]="signInForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  Signing In...
                } @else {
                  <div class="flex items-center">
                    <mat-icon class="mr-2">login</mat-icon>
                    Sign In
                  </div>
                }
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <a
                routerLink="/auth/sign-up"
                class="text-blue-600 hover:text-blue-800 font-medium ml-1 underline"
              >
                Sign up here
              </a>
            </p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitAttempted = signal(false);

  private readonly passwordVisibility = createPasswordVisibility();
  readonly showPassword = this.passwordVisibility.showPassword;
  readonly togglePasswordVisibility =
    this.passwordVisibility.togglePasswordVisibility;

  readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    this.submitAttempted.set(true);

    if (this.signInForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const credentials = this.signInForm.value as {
        email: string;
        password: string;
      };
      const result = await this.authService.signIn(credentials);

      if (!result.success) {
        this.errorMessage.set(result.message || 'Sign in failed');
      }
      // Success navigation is handled by AuthService
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred');
      console.error('Sign in error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.signInForm.get(fieldName);
    return this.validationService.getFieldError(control, fieldName);
  }
}
