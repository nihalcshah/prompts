"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateTag } from "@/app/actions/admin";

interface EditTagFormProps {
  currentTag: string;
}

export default function EditTagForm({ currentTag }: EditTagFormProps) {
  const [formData, setFormData] = useState({
    name: currentTag,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Load existing tag data
  useEffect(() => {
    const loadTagData = async () => {
      try {
        const { getTags } = await import("@/app/actions/admin");
        const result = await getTags();
        if (result.success) {
          const tag = result.data.find((t: any) => t.name === currentTag);
          if (tag) {
            setFormData({
              name: tag.name,
              description: tag.description || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading tag data:", error);
      }
    };
    loadTagData();
  }, [currentTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Tag name is required");
      return;
    }

    // Validate tag name (no spaces, lowercase)
    const tagName = formData.name.trim().toLowerCase().replace(/\s+/g, "-");
    if (tagName !== formData.name.trim()) {
      setFormData((prev) => ({ ...prev, name: tagName }));
    }

    setIsLoading(true);

    try {
      const result = await updateTag(currentTag, tagName, formData.description);

      if (result.success) {
        router.push("/admin/tags?updated=" + encodeURIComponent(tagName));
      } else {
        setError(result.error || "Failed to update tag");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      setError("Failed to update tag");
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

        {/* Current Tag Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-blue-300 font-medium text-sm mb-2">
            Current Tag
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-500/30">
              {currentTag}
            </span>
          </div>
        </div>

        {/* Tag Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            New Tag Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
              setFormData((prev) => ({ ...prev, name: value }));
            }}
            className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-950/50 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter new tag name (e.g., ai-tools, writing, marketing)"
            required
          />
          <p className="text-neutral-500 text-sm mt-1">
            Use lowercase letters and hyphens. Spaces will be converted to
            hyphens automatically.
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
            placeholder="Describe what this tag represents..."
          />
          <p className="text-neutral-500 text-sm mt-1">
            Help users understand when to use this tag
          </p>
        </div>

        {/* Warning */}
        {formData.name !== currentTag && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-yellow-300 font-medium text-sm mb-2">
              ⚠️ Important
            </h3>
            <p className="text-yellow-200/80 text-sm">
              Changing the tag name will update all prompts that currently use
              the tag "{currentTag}" to use "{formData.name}" instead.
            </p>
          </div>
        )}

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
            disabled={
              isLoading || !formData.name.trim() || formData.name === currentTag
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Update Tag
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
