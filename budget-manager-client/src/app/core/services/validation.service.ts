import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  /**
   * Password pattern validator
   */
  passwordPattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // Let required validator handle empty values

      if (value.length < 8) {
        return {
          passwordPattern: {
            message: 'Password must be at least 8 characters',
          },
        };
      }

      if (!/[A-Z]/.test(value)) {
        return {
          passwordPattern: {
            message: 'Password must contain at least one uppercase letter',
          },
        };
      }

      if (!/[a-z]/.test(value)) {
        return {
          passwordPattern: {
            message: 'Password must contain at least one lowercase letter',
          },
        };
      }

      if (!/[0-9]/.test(value)) {
        return {
          passwordPattern: {
            message: 'Password must contain at least one number',
          },
        };
      }

      return null;
    };
  }

  /**
   * Password confirmation validator (field-level)
   * Use this as a validator on the confirmPassword field
   */
  passwordMatch(passwordFieldName: string = 'password'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const password = control.parent.get(passwordFieldName)?.value;
      const confirmPassword = control.value;

      if (!password || !confirmPassword) return null;

      if (password !== confirmPassword) {
        return { passwordMatch: { message: "Passwords don't match" } };
      }

      return null;
    };
  }

  /**
   * Get user-friendly error message for a form control
   * Centralizes error message logic to reduce duplication
   */
  getFieldError(
    control: AbstractControl | null,
    fieldName: string,
  ): string | null {
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    const errors = control.errors;
    const capitalizedFieldName =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

    if (errors['required']) {
      return `${capitalizedFieldName} is required`;
    }

    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    if (errors['passwordPattern']) {
      return errors['passwordPattern'].message;
    }

    if (errors['passwordMatch']) {
      return errors['passwordMatch'].message;
    }

    return null;
  }
}
