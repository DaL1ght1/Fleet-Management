import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordPolicy: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const value = control.value ?? '';
  if (!value) {
    return null;
  }
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return { passwordLength: true };
  }
  return /\p{L}/u.test(value) && /\d/.test(value) ? null : { passwordMix: true };
};

export function matchesControl(otherName: string): ValidatorFn {
  return control => {
    const other = control.parent?.get(otherName);
    return other && control.value && control.value !== other.value ? { mismatch: true } : null;
  };
}

export function passwordStrength(value: string): 0 | 1 | 2 | 3 {
  if (!value) {
    return 0;
  }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\p{L}\d]/u].filter(pattern => pattern.test(value)).length;
  if (value.length >= 12 && variety >= 3) {
    return 3;
  }
  return value.length >= PASSWORD_MIN_LENGTH && variety >= 2 ? 2 : 1;
}
