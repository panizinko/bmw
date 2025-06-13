import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  selector: 'app-sign-up',
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
      class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🎯</div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Join Budget Planner
          </h1>
          <p class="text-gray-600">
            Create your account and start managing your finances
          </p>
        </div>

        <!-- Sign Up Form -->
        <mat-card class="p-6 shadow-lg">
          <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>Full Name (optional)</mat-label>
                <input
                  matInput
                  formControlName="name"
                  placeholder="Enter your full name"
                  autocomplete="name"
                />
              </mat-form-field>

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
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Create a strong password"
                  autocomplete="new-password"
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

              <!-- Password Requirements List -->
              @if (passwordValue()) {
                <div class="mb-4 -mt-2">
                  <ul class="text-sm space-y-1">
                    <li class="flex items-center">
                      <mat-icon
                        class="text-xs mr-2"
                        [class.text-green-500]="hasMinLength()"
                        [class.text-red-500]="!hasMinLength()"
                      >
                        {{ hasMinLength() ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                      <span
                        [class.text-green-600]="hasMinLength()"
                        [class.text-red-600]="!hasMinLength()"
                      >
                        At least 8 characters
                      </span>
                    </li>
                    <li class="flex items-center">
                      <mat-icon
                        class="text-xs mr-2"
                        [class.text-green-500]="hasUppercase()"
                        [class.text-red-500]="!hasUppercase()"
                      >
                        {{ hasUppercase() ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                      <span
                        [class.text-green-600]="hasUppercase()"
                        [class.text-red-600]="!hasUppercase()"
                      >
                        At least one uppercase letter
                      </span>
                    </li>
                    <li class="flex items-center">
                      <mat-icon
                        class="text-xs mr-2"
                        [class.text-green-500]="hasLowercase()"
                        [class.text-red-500]="!hasLowercase()"
                      >
                        {{ hasLowercase() ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                      <span
                        [class.text-green-600]="hasLowercase()"
                        [class.text-red-600]="!hasLowercase()"
                      >
                        At least one lowercase letter
                      </span>
                    </li>
                    <li class="flex items-center">
                      <mat-icon
                        class="text-xs mr-2"
                        [class.text-green-500]="hasNumber()"
                        [class.text-red-500]="!hasNumber()"
                      >
                        {{ hasNumber() ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                      <span
                        [class.text-green-600]="hasNumber()"
                        [class.text-red-600]="!hasNumber()"
                      >
                        At least one number
                      </span>
                    </li>
                  </ul>
                </div>
              }

              <mat-form-field appearance="fill" class="w-full">
                <mat-label>Confirm Password</mat-label>
                <input
                  matInput
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  matSuffix
                  mat-icon-button
                  (click)="toggleConfirmPasswordVisibility()"
                  [attr.aria-label]="
                    showConfirmPassword() ? 'Hide password' : 'Show password'
                  "
                >
                  <mat-icon>{{
                    showConfirmPassword() ? 'visibility_off' : 'visibility'
                  }}</mat-icon>
                </button>
                @if (getFieldError('confirmPassword')) {
                  <mat-error>{{ getFieldError('confirmPassword') }}</mat-error>
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

              @if (successMessage()) {
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <mat-icon class="text-green-500 mr-2"
                      >check_circle</mat-icon
                    >
                    <span class="text-green-700 text-sm">{{
                      successMessage()
                    }}</span>
                  </div>
                </div>
              }

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full py-3 text-lg font-medium"
                [disabled]="signUpForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  Creating Account...
                } @else {
                  <div class="flex items-center">
                    <mat-icon class="mr-2">person_add</mat-icon>
                    Create Account
                  </div>
                }
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Already have an account?
              <a
                routerLink="/auth/sign-in"
                class="text-blue-600 hover:text-blue-800 font-medium ml-1 underline"
              >
                Sign in here
              </a>
            </p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submitAttempted = signal(false);

  // Password visibility using utility
  private readonly passwordVisibility = createPasswordVisibility();
  readonly showPassword = this.passwordVisibility.showPassword;
  readonly showConfirmPassword = this.passwordVisibility.showConfirmPassword;
  readonly togglePasswordVisibility =
    this.passwordVisibility.togglePasswordVisibility;
  readonly toggleConfirmPasswordVisibility =
    this.passwordVisibility.toggleConfirmPasswordVisibility;

  readonly signUpForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, this.validationService.passwordPattern()],
    ],
    confirmPassword: [
      '',
      [Validators.required, this.validationService.passwordMatch()],
    ],
  });

  // Declarative password value signal using toSignal
  readonly passwordValue = toSignal(
    this.signUpForm.get('password')!.valueChanges,
    { initialValue: '' },
  );

  // Computed signals for password requirements validation
  readonly hasMinLength = computed(
    () => (this.passwordValue() || '').length >= 8,
  );
  readonly hasUppercase = computed(() =>
    /[A-Z]/.test(this.passwordValue() || ''),
  );
  readonly hasLowercase = computed(() =>
    /[a-z]/.test(this.passwordValue() || ''),
  );
  readonly hasNumber = computed(() => /[0-9]/.test(this.passwordValue() || ''));

  async onSubmit(): Promise<void> {
    this.submitAttempted.set(true);

    if (this.signUpForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const credentials = this.signUpForm.value as {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
      };
      const result = await this.authService.signUp(credentials);

      if (!result.success) {
        this.errorMessage.set(result.message || 'Sign up failed');
      } else {
        this.successMessage.set('Account created successfully! Redirecting...');
        // Success navigation is handled by AuthService
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred');
      console.error('Sign up error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.signUpForm.get(fieldName);
    return this.validationService.getFieldError(control, fieldName);
  }
}
