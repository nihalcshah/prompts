"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField, { FormError } from "@/components/form-field";
import {
  validateFormWithResult,
  CommonValidationRules,
  formatTagName,
  type ValidationErrors,
} from "@/utils/validation";

export default function CreateTagForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFieldChange = (name: string, value: string) => {
    let processedValue = value;

    // Auto-format tag name as user types
    if (name === "name") {
      processedValue = formatTagName(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateFormWithResult(formData, {
      name: CommonValidationRules.tagName,
      description: CommonValidationRules.description,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { createTag } = await import("@/app/actions/admin");
      const result = await createTag(formData.name, formData.description);

      if (result.success) {
        router.push("/admin/tags?created=" + encodeURIComponent(formData.name));
      } else {
        setError(result.error || "Failed to create tag");
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
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Tag Name */}
        <FormField
          label="Tag Name"
          name="name"
          value={formData.name}
          onChange={handleFieldChange}
          validation={CommonValidationRules.tagName}
          required
          placeholder="Enter tag name (e.g., ai-tools, writing, marketing)"
          helpText="Use lowercase letters and hyphens. Spaces will be converted to hyphens automatically."
        />

        <FormField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleFieldChange}
          validation={CommonValidationRules.description}
          type="textarea"
          rows={3}
          placeholder="Describe what this tag represents..."
          helpText="Help users understand when to use this tag"
        />

        {/* Tag Guidelines */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-blue-300 font-medium text-sm mb-2">
            Tag Guidelines
          </h3>
          <ul className="text-blue-200/80 text-sm space-y-1">
            <li>• Use descriptive, specific names</li>
            <li>• Keep tags short and memorable</li>
            <li>• Use hyphens instead of spaces</li>
            <li>• Avoid special characters</li>
            <li>• Be consistent with existing tags</li>
          </ul>
        </div>

        {/* Preview */}
        {formData.name && (
          <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/30">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">
              Preview
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/30">
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
            href="/admin/tags"
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
                Create Tag
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
