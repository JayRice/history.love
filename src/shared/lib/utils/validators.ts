// Validation utility functions

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Name validation
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  if (!name) {
    errors.push('Name is required');
  } else if (name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.length > 50) {
    errors.push('Name must be less than 50 characters');
  } else if (!nameRegex.test(name)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Username validation
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;

  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.length > 20) {
    errors.push('Username must be less than 20 characters');
  } else if (!usernameRegex.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Age validation
export function validateAge(age: number): ValidationResult {
  const errors: string[] = [];

  if (!age) {
    errors.push('Age is required');
  } else if (age < 18) {
    errors.push('You must be at least 18 years old');
  } else if (age > 120) {
    errors.push('Please enter a valid age');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Phone number validation (US format)
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = [];
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  if (!phone) {
    errors.push('Phone number is required');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Please enter a valid phone number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// General text validation
export function validateText(text: string, minLength = 1, maxLength = 1000): ValidationResult {
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push('This field is required');
  } else if (text.length < minLength) {
    errors.push(`Must be at least ${minLength} characters long`);
  } else if (text.length > maxLength) {
    errors.push(`Must be less than ${maxLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// URL validation
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];

  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Date validation
export function validateDate(dateString: string, allowFuture = false): ValidationResult {
  const errors: string[] = [];
  const date = new Date(dateString);
  const now = new Date();

  if (!dateString) {
    errors.push('Date is required');
  } else if (isNaN(date.getTime())) {
    errors.push('Please enter a valid date');
  } else if (!allowFuture && date > now) {
    errors.push('Date cannot be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}