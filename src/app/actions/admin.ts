"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Types
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  categories: { id: string; name: string; description?: string }[];
  tags?: string[];
  notes?: string;
  is_public: boolean;
  author: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

interface PromptCategory {
  categories: { id: string; name: string; description?: string };
}

interface PromptTag {
  tags: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

// Helper function to verify admin access
async function verifyAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.email !== "nihalcshah@gmail.com") {
    redirect("/signin");
  }

  return { supabase, user };
}

// PROMPT ACTIONS
export async function createPrompt(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await verifyAdminAccess();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;
    const notes = formData.get("notes") as string;
    const isPublic = formData.get("is_public") === "true";

    if (!title || !content) {
      return { success: false, error: "Title and content are required" };
    }

    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const { data, error } = await supabase
      .from("prompts")
      .insert({
        title,
        content,
        description: description || null,
        notes: notes || null,
        is_public: isPublic,
        author: user.email!,
        author_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Handle category relationship if provided
    if (category && category.trim()) {
      // Find or create the category
      let categoryId: string;
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category.trim())
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from("categories")
          .insert({ name: category.trim() })
          .select("id")
          .single();

        if (categoryError) {
          return {
            success: false,
            error: `Failed to create category: ${categoryError.message}`,
          };
        }
        categoryId = newCategory.id;
      }

      // Create the relationship
      const { error: relationError } = await supabase
        .from("prompt_categories")
        .insert({
          prompt_id: data.id,
          category_id: categoryId,
        });

      if (relationError) {
        return {
          success: false,
          error: `Failed to link category: ${relationError.message}`,
        };
      }
    }

    // Handle tag relationships if provided
    if (tagsArray.length > 0) {
      for (const tagName of tagsArray) {
        // Find or create the tag
        let tagId: string;
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single();

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single();

          if (tagError) {
            return {
              success: false,
              error: `Failed to create tag: ${tagError.message}`,
            };
          }
          tagId = newTag.id;
        }

        // Create the relationship
        const { error: tagRelationError } = await supabase
          .from("prompt_tags")
          .insert({
            prompt_id: data.id,
            tag_id: tagId,
          });

        if (tagRelationError) {
          return {
            success: false,
            error: `Failed to link tag: ${tagRelationError.message}`,
          };
        }
      }
    }

    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true, data };
  } catch (error) {
    console.error("Create prompt error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updatePrompt(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;
    const notes = formData.get("notes") as string;
    const isPublic = formData.get("is_public") === "true";

    if (!title || !content) {
      return { success: false, error: "Title and content are required" };
    }

    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    // Update the prompt basic fields
    const { data, error } = await supabase
      .from("prompts")
      .update({
        title,
        content,
        description: description || null,
        notes: notes || null,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Handle category relationships - remove existing and add new
    await supabase.from("prompt_categories").delete().eq("prompt_id", id);

    if (category && category.trim()) {
      // Find or create the category
      let categoryId: string;
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category.trim())
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from("categories")
          .insert({ name: category.trim() })
          .select("id")
          .single();

        if (categoryError) {
          return {
            success: false,
            error: `Failed to create category: ${categoryError.message}`,
          };
        }
        categoryId = newCategory.id;
      }

      // Create the relationship
      const { error: relationError } = await supabase
        .from("prompt_categories")
        .insert({
          prompt_id: id,
          category_id: categoryId,
        });

      if (relationError) {
        return {
          success: false,
          error: `Failed to link category: ${relationError.message}`,
        };
      }
    }

    // Handle tag relationships - remove existing and add new
    await supabase.from("prompt_tags").delete().eq("prompt_id", id);

    if (tagsArray.length > 0) {
      for (const tagName of tagsArray) {
        // Find or create the tag
        let tagId: string;
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single();

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single();

          if (tagError) {
            return {
              success: false,
              error: `Failed to create tag: ${tagError.message}`,
            };
          }
          tagId = newTag.id;
        }

        // Create the relationship
        const { error: tagRelationError } = await supabase
          .from("prompt_tags")
          .insert({
            prompt_id: id,
            tag_id: tagId,
          });

        if (tagRelationError) {
          return {
            success: false,
            error: `Failed to link tag: ${tagRelationError.message}`,
          };
        }
      }
    }

    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");
    revalidatePath(`/prompt/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error("Update prompt error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deletePrompt(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    // First delete related records in prompt_categories
    const { error: categoriesError } = await supabase
      .from("prompt_categories")
      .delete()
      .eq("prompt_id", id);

    if (categoriesError) {
      return {
        success: false,
        error: `Failed to delete category relationships: ${categoriesError.message}`,
      };
    }

    // Then delete related records in prompt_tags
    const { error: tagsError } = await supabase
      .from("prompt_tags")
      .delete()
      .eq("prompt_id", id);

    if (tagsError) {
      return {
        success: false,
        error: `Failed to delete tag relationships: ${tagsError.message}`,
      };
    }

    // Finally delete the prompt itself
    const { error } = await supabase.from("prompts").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true };
  } catch (error) {
    console.error("Delete prompt error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getPrompts(filters?: {
  search?: string;
  category?: string;
  tag?: string;
  isPublic?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    let query = supabase
      .from("prompts")
      .select(
        `
        *,
        prompt_categories(
          categories(
            id,
            name,
            description
          )
        ),
        prompt_tags(
          tags(
            id,
            name,
            description
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.isPublic !== undefined) {
      query = query.eq("is_public", filters.isPublic);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform the data to flatten categories and tags
    const transformedData =
      data?.map((prompt) => ({
        ...prompt,
        categories:
          prompt.prompt_categories?.map(
            (pc: PromptCategory) => pc.categories
          ) || [],
        tags: prompt.prompt_tags?.map((pt: PromptTag) => pt.tags.name) || [],
      })) || [];

    // Apply filters after fetching
    let filteredData = transformedData;
    if (filters?.category) {
      filteredData = filteredData.filter((prompt) =>
        prompt.categories.some((cat: Category) => cat.name === filters.category)
      );
    }

    if (filters?.tag) {
      filteredData = filteredData.filter((prompt) =>
        prompt.tags.includes(filters.tag)
      );
    }

    return { success: true, data: filteredData };
  } catch (error) {
    console.error("Get prompts error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getPrompt(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    const { data, error } = await supabase
      .from("prompts")
      .select(
        `
        *,
        prompt_categories(categories(id, name, description)),
        prompt_tags(tags(name))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform the data to flatten categories and tags
    const transformedData = {
      ...data,
      categories:
        data.prompt_categories?.map((pc: PromptCategory) => pc.categories) ||
        [],
      tags: data.prompt_tags?.map((pt: PromptTag) => pt.tags.name) || [],
    };

    // Remove the junction table data
    delete transformedData.prompt_categories;
    delete transformedData.prompt_tags;

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Get prompt error:", error);
    return { success: false, error: "Internal server error" };
  }
}

// CATEGORY ACTIONS
export async function getCategories(): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get categories error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function createCategory(
  name: string,
  description?: string
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    if (!name || typeof name !== "string" || !name.trim()) {
      return { success: false, error: "Category name is required" };
    }

    const categoryName = name.trim().toLowerCase().replace(/\s+/g, "-");

    // Check if category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return { success: false, error: checkError.message };
    }

    if (existingCategory) {
      return { success: false, error: "Category already exists" };
    }

    // Insert new category
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: categoryName,
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/prompts");

    return { success: true, data };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateCategory(
  oldCategory: string,
  newCategory: string
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    if (!oldCategory || !newCategory) {
      return {
        success: false,
        error: "Both old and new category names are required",
      };
    }

    if (oldCategory === newCategory) {
      return { success: false, error: "New category name must be different" };
    }

    // Update the category in the categories table
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: newCategory,
        updated_at: new Date().toISOString(),
      })
      .eq("name", oldCategory)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Category not found" };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return {
      success: true,
      data: { updated: data.length, category: newCategory },
    };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteCategory(category: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    if (!category) {
      return { success: false, error: "Category name is required" };
    }

    // Get the category ID first
    const { data: categoryData, error: fetchError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .single();

    if (fetchError) {
      return { success: false, error: "Category not found" };
    }

    // Count how many prompts will be affected
    const { data: affectedPrompts, error: countError } = await supabase
      .from("prompt_categories")
      .select("prompt_id")
      .eq("category_id", categoryData.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    // Delete the category (this will cascade delete the relationships)
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("name", category);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true, data: { updated: affectedPrompts?.length || 0 } };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Internal server error" };
  }
}

// TAG ACTIONS
export async function getTags(): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get tags error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateTag(
  oldTag: string,
  newTag: string,
  description?: string
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    if (!oldTag || !newTag) {
      return {
        success: false,
        error: "Both old and new tag names are required",
      };
    }

    const formattedNewTag = newTag.trim().toLowerCase().replace(/\s+/g, "-");

    if (oldTag === formattedNewTag) {
      // If only description is changing, update the tags table
      const { data, error } = await supabase
        .from("tags")
        .update({ description: description?.trim() || null })
        .eq("name", oldTag)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath("/admin/tags");
      return { success: true, data };
    }

    // Check if new tag name already exists
    const { data: existingTag, error: checkError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", formattedNewTag)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return { success: false, error: checkError.message };
    }

    if (existingTag) {
      return { success: false, error: "A tag with this name already exists" };
    }

    // Check if the tag exists
    const { data: tagToUpdate, error: tagCheckError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", oldTag)
      .single();

    if (tagCheckError) {
      return { success: false, error: "Tag not found" };
    }

    // Count how many prompts use this tag
    const { count, error: countError } = await supabase
      .from("prompt_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagToUpdate.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    // Update the tag in the tags table (relationships will automatically reflect the new name)
    const { data: updatedTag, error: updateTagError } = await supabase
      .from("tags")
      .update({
        name: formattedNewTag,
        description: description?.trim() || null,
      })
      .eq("name", oldTag)
      .select()
      .single();

    if (updateTagError) {
      return { success: false, error: updateTagError.message };
    }

    revalidatePath("/admin/tags");
    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true, data: { updated: count || 0, tag: updatedTag } };
  } catch (error) {
    console.error("Update tag error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteTag(tag: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    if (!tag) {
      return { success: false, error: "Tag name is required" };
    }

    // Get the tag ID and count affected prompts
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tag)
      .single();

    if (tagError) {
      return { success: false, error: "Tag not found" };
    }

    // Count how many prompts use this tag
    const { count, error: countError } = await supabase
      .from("prompt_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagData.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    // Delete the tag from the tags table (CASCADE will remove relationships)
    const { error: deleteTagError } = await supabase
      .from("tags")
      .delete()
      .eq("name", tag);

    if (deleteTagError) {
      return { success: false, error: deleteTagError.message };
    }

    revalidatePath("/admin/tags");
    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true, data: { updated: count || 0 } };
  } catch (error) {
    console.error("Delete tag error:", error);
    return { success: false, error: "Internal server error" };
  }
}

// BULK ACTIONS
export async function bulkUpdatePrompts(
  ids: string[],
  updates: Partial<Prompt>
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    const { data, error } = await supabase
      .from("prompts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true, data };
  } catch (error) {
    console.error("Bulk update prompts error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function bulkDeletePrompts(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    // First delete related records in prompt_categories
    const { error: categoriesError } = await supabase
      .from("prompt_categories")
      .delete()
      .in("prompt_id", ids);

    if (categoriesError) {
      return {
        success: false,
        error: `Failed to delete category relationships: ${categoriesError.message}`,
      };
    }

    // Then delete related records in prompt_tags
    const { error: tagsError } = await supabase
      .from("prompt_tags")
      .delete()
      .in("prompt_id", ids);

    if (tagsError) {
      return {
        success: false,
        error: `Failed to delete tag relationships: ${tagsError.message}`,
      };
    }

    // Finally delete the prompts themselves
    const { error } = await supabase.from("prompts").delete().in("id", ids);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/prompts");
    revalidatePath("/admin");
    revalidatePath("/public");

    return { success: true };
  } catch (error) {
    console.error("Bulk delete prompts error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function createTag(
  name: string,
  description?: string
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess();

    if (!name || typeof name !== "string" || !name.trim()) {
      return { success: false, error: "Tag name is required" };
    }

    const tagName = name.trim().toLowerCase().replace(/\s+/g, "-");

    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagName)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return { success: false, error: checkError.message };
    }

    if (existingTag) {
      return { success: false, error: "Tag already exists" };
    }

    // Insert new tag
    const { data, error } = await supabase
      .from("tags")
      .insert({
        name: tagName,
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/tags");
    revalidatePath("/admin/prompts");

    return { success: true, data };
  } catch (error) {
    console.error("Create tag error:", error);
    return { success: false, error: "Internal server error" };
  }
}
