"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCategory } from "@/app/actions/admin";
import FormField, { FormError } from "@/components/form-field";
import {
  validateFormWithResult,
  CommonValidationRules,
  type ValidationErrors,
} from "@/utils/validation";

export default function CreateCategoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateFormWithResult(formData, {
      name: CommonValidationRules.categoryName,
      description: CommonValidationRules.description,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      console.log(formData.name, formData.description);
      const result = await createCategory(
        formData.name.trim(),
        formData.description.trim() || undefined
      );

      if (result.success) {
        router.push("/admin/categories");
      } else {
        setError(result.error || "Failed to create category");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-950/50 backdrop-blur-lg rounded-xl border border-neutral-700/50 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormError error={error} />

        <FormField
          label="Category Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleFieldChange}
          validation={CommonValidationRules.categoryName}
          placeholder="Enter category name (e.g., AI Tools, Writing, Marketing)"
          required
          helpText="Choose a clear, descriptive name for your category"
        />

        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleFieldChange}
          validation={CommonValidationRules.description}
          placeholder="Describe what this category is for..."
          rows={3}
          helpText="Help users understand what types of prompts belong in this category"
        />

        {/* Preview */}
        {formData.name && (
          <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/30">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">
              Preview
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300 border border-blue-500/30">
                {formData.name}
              </span>
            </div>
            {formData.description && (
              <p className="text-neutral-400 text-sm mt-2">
                {formData.description}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-700">
          <Link
            href="/admin/categories"
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
