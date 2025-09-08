"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePrompt, type Prompt } from "@/app/actions/admin";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface EditPromptFormProps {
  prompt: Prompt;
  categories: Category[];
  tags: Tag[];
}

export default function EditPromptForm({
  prompt,
  categories,
  tags,
}: EditPromptFormProps) {
  const [formData, setFormData] = useState({
    title: prompt.title,
    content: prompt.content,
    description: prompt.description || "",
    category: prompt.categories?.[0]?.name || "",
    tags: prompt.tags || [],
    notes: prompt.notes || "",
    is_public: prompt.is_public,
  });
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    startTransition(async () => {
      try {
        const form = new FormData();
        form.append("title", formData.title.trim());
        form.append("content", formData.content.trim());
        form.append("description", formData.description.trim());
        form.append("category", formData.category);
        form.append("tags", formData.tags.join(","));
        form.append("notes", formData.notes.trim());
        form.append("is_public", formData.is_public.toString());

        const result = await updatePrompt(prompt.id, form);

        if (result.success) {
          router.push("/admin/prompts");
        } else {
          setError(result.error || "Failed to update prompt");
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleTagAdd = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter prompt title"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Content *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={8}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your prompt content"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the prompt"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Tags
          </label>
          <div className="space-y-3">
            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
              >
                Add
              </button>
            </div>

            {/* Existing Tags */}
            {tags.length > 0 && (
              <div>
                <p className="text-sm text-neutral-400 mb-2">Available tags:</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag.name)) {
                          setFormData((prev) => ({
                            ...prev,
                            tags: [...prev.tags, tag.name],
                          }));
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                        formData.tags.includes(tag.name)
                          ? "bg-blue-600 text-white cursor-not-allowed"
                          : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                      }`}
                      disabled={formData.tags.includes(tag.name)}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div>
                <p className="text-sm text-neutral-400 mb-2">Selected tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-blue-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes or context for this prompt"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_public: e.target.checked,
                }))
              }
              className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-neutral-300">
              Make this prompt public
            </span>
          </label>
          <p className="text-xs text-neutral-500 mt-1">
            Public prompts can be viewed by anyone. Private prompts are only
            visible to you.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0">
          <Link
            href="/admin/prompts"
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors duration-200 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Updating..." : "Update Prompt"}
          </button>
        </div>
      </form>
    </div>
  );
}
