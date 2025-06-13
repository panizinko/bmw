import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom } from 'rxjs';
import {
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
} from '../models/auth.model';
import { AuthHttpService } from './auth-http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<AuthUser | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _isLoading = signal<boolean>(false);

  // Read-only computed signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Computed signal for user display name
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.name || 'User';
  });

  constructor(
    private router: Router,
    private authHttp: AuthHttpService,
  ) {}

  async signUp(
    credentials: SignUpCredentials,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await firstValueFrom(
        this.authHttp.signUp(credentials).pipe(
          catchError((error) => {
            let message = 'Sign up failed. Please try again.';

            if (error.status === 400 && error.error?.detail) {
              message = error.error.detail;
            }

            throw new Error(message);
          }),
        ),
      );

      // After successful sign up, try to sign in automatically
      const signInResult = await this.signIn({
        email: credentials.email,
        password: credentials.password,
      });

      if (!signInResult.success) {
        return {
          success: false,
          message:
            'Account created but sign in failed. Please sign in manually.',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Sign up failed. Please try again.',
      };
    }
  }

  async signIn(
    credentials: SignInCredentials,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const userPublic = await firstValueFrom(
        this.authHttp.signIn(credentials).pipe(
          catchError((error) => {
            let message = 'Sign in failed. Please try again.';

            if (error.status === 401) {
              message = 'Incorrect email or password';
            } else if (error.error?.detail) {
              message = error.error.detail;
            }

            throw new Error(message);
          }),
        ),
      );

      this.setAuthenticatedUser(userPublic);
      this.navigateAfterAuth();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Sign in failed. Please try again.',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.authHttp.signOut());
    } catch (error) {
      // Continue with local cleanup even if backend call fails
    } finally {
      this.clearAuth();
      this.router.navigate(['/auth/sign-in']);
    }
  }

  async checkAuthenticationStatus(): Promise<void> {
    this._isLoading.set(true);

    try {
      const userPublic = await firstValueFrom(
        this.authHttp.getCurrentUser().pipe(
          catchError((error) => {
            if (error.status === 401) {
              this.clearAuth();
            }
            throw error;
          }),
        ),
      );

      this.setAuthenticatedUser(userPublic);
    } catch (error) {
      this.clearAuth();
    } finally {
      this._isLoading.set(false);
    }
  }

  async refreshTokenAndUpdateState(): Promise<void> {
    try {
      const userPublic = await firstValueFrom(this.authHttp.refreshToken());
      this.setAuthenticatedUser(userPublic);
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  setAuthenticatedUser(userPublic: any): void {
    const authUser: AuthUser = {
      id: userPublic.id,
      name: userPublic.name || userPublic.email.split('@')[0],
      email: userPublic.email,
      createdAt: new Date(userPublic.created_at),
      lastLogin: new Date(),
    };

    this._currentUser.set(authUser);
    this._isAuthenticated.set(true);
  }

  clearAuth(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  private navigateAfterAuth(): void {
    if (this.hasCompletedOnboarding()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/onboarding']);
    }
  }

  hasCompletedOnboarding(): boolean {
    const budgetData = localStorage.getItem('budget-data');

    if (!budgetData) {
      return false;
    }

    try {
      const data = JSON.parse(budgetData);
      return !!(data.user && data.categories && data.categories.length > 0);
    } catch {
      return false;
    }
  }

  canAccessRoute(route: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (route.startsWith('/onboarding')) {
      return true;
    }

    return this.hasCompletedOnboarding();
  }
}
