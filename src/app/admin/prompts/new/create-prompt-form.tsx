"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPrompt } from "@/app/actions/admin";
import FormField, { FormError } from "@/components/form-field";
import {
  validateForm,
  hasValidationErrors,
  CommonValidationRules,
  formatTagName,
  validateTags,
  type ValidationErrors,
} from "@/utils/validation";

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

interface CreatePromptFormProps {
  categories: Category[];
  tags: Tag[];
}

export default function CreatePromptForm({
  categories,
  tags,
}: CreatePromptFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    category: "",
    tags: [] as string[],
    notes: "",
    is_public: false,
  });
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate form data
    const validationRules = {
      title: CommonValidationRules.title,
      content: CommonValidationRules.content,
      description: CommonValidationRules.description,
      category: { required: false },
      notes: { maxLength: 1000 },
    };

    const errors = validateForm(formData, validationRules);

    // Validate tags separately
    if (formData.tags.length > 0) {
      const { errors: tagErrors } = validateTags(formData.tags);
      if (tagErrors.length > 0) {
        errors.tags = tagErrors.join(", ");
      }
    }

    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      setError("Please fix the validation errors below");
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

        const result = await createPrompt(form);

        if (result.success) {
          router.push("/admin/prompts");
        } else {
          setError(result.error || "Failed to create prompt");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleTagAdd = () => {
    const tag = formatTagName(newTag);
    if (tag && !formData.tags.includes(tag)) {
      // Validate the tag
      const tagError = validateTags([tag]);
      if (tagError.errors.length === 0) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
        setNewTag("");
        // Clear any previous tag errors
        if (fieldErrors.tags) {
          const newErrors = { ...fieldErrors };
          delete newErrors.tags;
          setFieldErrors(newErrors);
        }
      } else {
        setFieldErrors((prev) => ({ ...prev, tags: tagError.errors[0] }));
      }
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

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormError error={error} />

        <FormField
          label="Title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleFieldChange}
          validation={CommonValidationRules.title}
          placeholder="Enter prompt title"
          required
          helpText="A clear, descriptive title for your prompt"
        />

        <FormField
          label="Content"
          name="content"
          type="textarea"
          value={formData.content}
          onChange={handleFieldChange}
          validation={CommonValidationRules.content}
          placeholder="Enter your prompt content"
          required
          rows={8}
          helpText="The main content of your prompt"
        />

        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleFieldChange}
          validation={CommonValidationRules.description}
          placeholder="Brief description of the prompt"
          rows={3}
          helpText="Optional description to help users understand the prompt's purpose"
        />

        <FormField
          label="Category"
          name="category"
          type="select"
          value={formData.category}
          onChange={handleFieldChange}
          placeholder="Select a category"
          options={categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          }))}
          helpText="Choose a category that best fits this prompt"
        />

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Tags
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className={`flex-1 px-3 py-2 bg-neutral-800 border rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.tags ? "border-red-500" : "border-neutral-700"
                }`}
                placeholder="Add a tag (e.g., productivity, ai, writing)"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {fieldErrors.tags && (
              <p className="text-red-400 text-sm">{fieldErrors.tags}</p>
            )}
            <p className="text-neutral-400 text-sm">
              Tags help users find your prompt. Use lowercase letters, numbers,
              and hyphens only.
            </p>

            {/* Existing Tags */}
            {tags.length > 0 && (
              <div>
                <p className="text-sm text-neutral-400 mb-2">Existing tags:</p>
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

        <FormField
          label="Make this prompt public"
          name="is_public"
          type="checkbox"
          value={formData.is_public}
          onChange={handleFieldChange}
          helpText="Public prompts can be viewed by anyone. Private prompts are only visible to you."
        />

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
            {isPending ? "Creating..." : "Create Prompt"}
          </button>
        </div>
      </form>
    </div>
  );
}
