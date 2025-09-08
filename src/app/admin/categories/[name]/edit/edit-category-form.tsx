"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateCategory } from "@/app/actions/admin";

interface EditCategoryFormProps {
  currentCategory: string;
}

export default function EditCategoryForm({
  currentCategory,
}: EditCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: currentCategory,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    if (formData.name.trim() === currentCategory) {
      setError("Please enter a different category name");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateCategory(
        currentCategory,
        formData.name.trim()
      );

      if (!result.success) {
        setError(result.error || "Failed to update category");
        return;
      }

      router.push(
        "/admin/categories?updated=" + encodeURIComponent(formData.name)
      );
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category");
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

        {/* Current Category Info */}
        <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-neutral-300 mb-2">
            Current Category
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-700/50 text-neutral-300 border border-neutral-600/50">
              {currentCategory}
            </span>
          </div>
        </div>

        {/* New Category Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            New Category Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-950/50 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter new category name"
            required
          />
          <p className="text-neutral-500 text-sm mt-1">
            This will update all prompts that currently use "{currentCategory}"
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-950/50 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            placeholder="Describe what this category is for..."
          />
          <p className="text-neutral-500 text-sm mt-1">
            Help users understand what types of prompts belong in this category
          </p>
        </div>

        {/* Preview */}
        {formData.name && formData.name !== currentCategory && (
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

        {/* Warning */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h4 className="text-yellow-300 font-medium text-sm">Important</h4>
              <p className="text-yellow-200/80 text-sm mt-1">
                Updating this category will change it for all prompts that
                currently use "{currentCategory}". This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

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
            disabled={
              isLoading ||
              !formData.name.trim() ||
              formData.name.trim() === currentCategory
            }
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
                Updating...
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Update Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
