"use client";

import { useState, useEffect } from "react";
import { ValidationRule, validateField } from "@/utils/validation";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "textarea" | "select" | "checkbox";
  value: any;
  onChange: (name: string, value: any) => void;
  validation?: ValidationRule;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  helpText?: string;
  className?: string;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  validation,
  placeholder,
  required,
  disabled,
  rows = 3,
  options = [],
  helpText,
  className = "",
}: FormFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Validate field when value changes
  useEffect(() => {
    if (touched && validation) {
      const validationError = validateField(value, validation);
      setError(validationError);
    }
  }, [value, validation, touched]);

  const handleChange = (newValue: any) => {
    onChange(name, newValue);
    if (!touched) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validation) {
      const validationError = validateField(value, validation);
      setError(validationError);
    }
  };

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border bg-neutral-950/50 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
    error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-neutral-700 focus:ring-blue-500 focus:border-blue-500"
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`${baseInputClasses} resize-none`}
          />
        );

      case "select":
        return (
          <select
            id={name}
            name={name}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{placeholder || "Select an option"}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              disabled={disabled}
              className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-neutral-300">
              {label}
            </span>
          </label>
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  if (type === "checkbox") {
    return (
      <div className={`space-y-2 ${className}`}>
        {renderInput()}
        {helpText && <p className="text-xs text-neutral-500">{helpText}</p>}
        {error && touched && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {helpText && <p className="text-xs text-neutral-500">{helpText}</p>}
      {error && touched && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Helper component for displaying form-level errors
export function FormError({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-red-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    </div>
  );
}

// Helper component for displaying success messages
export function FormSuccess({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-green-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p className="text-green-200 text-sm">{message}</p>
      </div>
    </div>
  );
}
