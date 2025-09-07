// Form validation utilities for admin forms

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

/**
 * Validates a single field based on its rules
 */
export function validateField(value: any, rules: ValidationRule): string | null {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required'
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null
  }

  const stringValue = String(value).trim()

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters long`
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters long`
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Invalid format'
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

/**
 * Validates an entire form based on validation rules
 */
export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

/**
 * Validates an entire form and returns validation result with isValid flag
 */
export function validateFormWithResult(data: Record<string, any>, rules: ValidationRules): { isValid: boolean; errors: ValidationErrors } {
  const errors = validateForm(data, rules)
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Checks if there are any validation errors
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  tag: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s-_]+$/
}

/**
 * Common validation rules for different field types
 */
export const CommonValidationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    pattern: ValidationPatterns.noSpecialChars
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 10000
  },
  description: {
    maxLength: 500
  },
  categoryName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: ValidationPatterns.noSpecialChars
  },
  tagName: {
    required: true,
    minLength: 2,
    maxLength: 30,
    pattern: ValidationPatterns.tag,
    custom: (value: string) => {
      if (value && value !== value.toLowerCase()) {
        return 'Tag names must be lowercase'
      }
      if (value && value.includes(' ')) {
        return 'Tag names cannot contain spaces (use hyphens instead)'
      }
      return null
    }
  },
  email: {
    required: true,
    pattern: ValidationPatterns.email
  },
  url: {
    pattern: ValidationPatterns.url
  }
}

/**
 * Sanitizes input by trimming whitespace and removing potentially harmful characters
 */
export function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>"'&]/g, '')
}

/**
 * Formats tag names to be URL-friendly
 */
export function formatTagName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Formats category names to be consistent
 */
export function formatCategoryName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Validates and formats an array of tags
 */
export function validateTags(tags: string[]): { valid: string[], errors: string[] } {
  const valid: string[] = []
  const errors: string[] = []

  for (const tag of tags) {
    const formatted = formatTagName(tag)
    if (!formatted) {
      errors.push(`Invalid tag: "${tag}"`)
      continue
    }
    
    const error = validateField(formatted, CommonValidationRules.tagName)
    if (error) {
      errors.push(`Tag "${tag}": ${error}`)
    } else {
      valid.push(formatted)
    }
  }

  return { valid, errors }
}