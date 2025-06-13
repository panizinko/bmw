import { signal } from '@angular/core';

/**
 * Utility function to create password visibility state management
 * Returns signals and toggle functions for both password and confirm password fields
 * Components can use what they need and ignore the rest
 */
export function createPasswordVisibility() {
  const showPassword = signal(false);
  const showConfirmPassword = signal(false);

  const togglePasswordVisibility = (): void => {
    showPassword.update((show) => !show);
  };

  const toggleConfirmPasswordVisibility = (): void => {
    showConfirmPassword.update((show) => !show);
  };

  return {
    showPassword: showPassword.asReadonly(),
    showConfirmPassword: showConfirmPassword.asReadonly(),
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
}
