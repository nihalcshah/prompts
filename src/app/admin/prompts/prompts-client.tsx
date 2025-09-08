"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  deletePrompt,
  bulkDeletePrompts,
  bulkUpdatePrompts,
  type Prompt,
} from "@/app/actions/admin";
import { GiPencilBrush } from "react-icons/gi";

interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface PromptsClientProps {
  initialPrompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  initialFilters: {
    search?: string;
    category?: string;
    tag?: string;
    filter?: "public" | "private";
  };
}

export default function PromptsClient({
  initialPrompts,
  categories,
  tags,
  initialFilters,
}: PromptsClientProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/admin/prompts?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/prompts?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await deletePrompt(id);
      if (result.success) {
        setPrompts(prompts.filter((p) => p.id !== id));
      } else {
        setError(result.error || "Failed to delete prompt");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedPrompts.length} prompts?`
      )
    )
      return;

    setIsLoading(true);
    setError("");

    try {
      const result = await bulkDeletePrompts(selectedPrompts);
      if (result.success) {
        setPrompts(prompts.filter((p) => !selectedPrompts.includes(p.id)));
        setSelectedPrompts([]);
      } else {
        setError(result.error || "Failed to delete prompts");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async (updates: Partial<Prompt>) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await bulkUpdatePrompts(selectedPrompts, updates);
      if (result.success) {
        setPrompts(
          prompts.map((p) =>
            selectedPrompts.includes(p.id)
              ? { ...p, ...updates, updated_at: new Date().toISOString() }
              : p
          )
        );
        setSelectedPrompts([]);
      } else {
        setError(result.error || "Failed to update prompts");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPrompts.length === prompts.length) {
      setSelectedPrompts([]);
    } else {
      setSelectedPrompts(prompts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPrompts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search prompts..."
              defaultValue={initialFilters.search || ""}
              onChange={(e) => {
                startTransition(() => {
                  handleSearch(e.target.value);
                });
              }}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Category
            </label>
            <select
              defaultValue={initialFilters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tag
            </label>
            <select
              defaultValue={initialFilters.tag || ""}
              onChange={(e) => handleFilterChange("tag", e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Visibility
            </label>
            <select
              defaultValue={initialFilters.filter || ""}
              onChange={(e) => handleFilterChange("filter", e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Prompts</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPrompts.length > 0 && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-blue-200 mb-4 sm:mb-0">
              {selectedPrompts.length} prompt
              {selectedPrompts.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkUpdate({ is_public: true })}
                disabled={isLoading}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors duration-200 disabled:opacity-50"
              >
                Make Public
              </button>
              <button
                onClick={() => handleBulkUpdate({ is_public: false })}
                disabled={isLoading}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors duration-200 disabled:opacity-50"
              >
                Make Private
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors duration-200 disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Prompts Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPrompts.length === prompts.length &&
                      prompts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-950 divide-y divide-neutral-800">
              {prompts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-neutral-400">
                      <GiPencilBrush className="text-4xl mb-4 block mx-auto" />
                      <p className="text-lg font-medium mb-2">
                        No prompts found
                      </p>
                      <p className="text-sm">
                        Create your first prompt to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                prompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-neutral-800">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPrompts.includes(prompt.id)}
                        onChange={() => toggleSelect(prompt.id)}
                        className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {prompt.title}
                        </div>
                        {prompt.description && (
                          <div className="text-sm text-neutral-400 mt-1 line-clamp-2">
                            {prompt.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {prompt.categories && prompt.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {prompt.categories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-500 text-sm">
                          No category
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {prompt.tags && prompt.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-700 text-neutral-300"
                            >
                              #{tag}
                            </span>
                          ))}
                          {prompt.tags.length > 3 && (
                            <span className="text-xs text-neutral-500">
                              +{prompt.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-500 text-sm">
                          No tags
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prompt.is_public
                            ? "bg-green-900 text-green-200"
                            : "bg-yellow-900 text-yellow-200"
                        }`}
                      >
                        {prompt.is_public ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {new Date(prompt.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/prompts/${prompt.id}/edit`}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(prompt.id)}
                          disabled={isLoading}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
