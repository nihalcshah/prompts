'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Types
export interface Prompt {
  id: string
  title: string
  content: string
  description?: string
  category?: string
  tags?: string[]
  notes?: string
  is_public: boolean
  author: string
  author_name?: string
  created_at: string
  updated_at: string
}

export interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

// Helper function to verify admin access
async function verifyAdminAccess() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || user.email !== 'nihalcshah@gmail.com') {
    redirect('/signin')
  }
  
  return { supabase, user }
}

// PROMPT ACTIONS
export async function createPrompt(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await verifyAdminAccess()
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const notes = formData.get('notes') as string
    const isPublic = formData.get('is_public') === 'true'
    
    if (!title || !content) {
      return { success: false, error: 'Title and content are required' }
    }
    
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        title,
        content,
        description: description || null,
        category: category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        notes: notes || null,
        is_public: isPublic,
        author: user.email!,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true, data }
  } catch (error) {
    console.error('Create prompt error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function updatePrompt(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const notes = formData.get('notes') as string
    const isPublic = formData.get('is_public') === 'true'
    
    if (!title || !content) {
      return { success: false, error: 'Title and content are required' }
    }
    
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    
    const { data, error } = await supabase
      .from('prompts')
      .update({
        title,
        content,
        description: description || null,
        category: category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        notes: notes || null,
        is_public: isPublic,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    revalidatePath(`/prompt/${id}`)
    
    return { success: true, data }
  } catch (error) {
    console.error('Update prompt error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function deletePrompt(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true }
  } catch (error) {
    console.error('Delete prompt error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function getPrompts(filters?: {
  search?: string
  category?: string
  tag?: string
  isPublic?: boolean
}): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.tag) {
      query = query.contains('tags', [filters.tag])
    }
    
    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Get prompts error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function getPrompt(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Get prompt error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

// CATEGORY ACTIONS
export async function getCategories(): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Get categories error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function createCategory(name: string, description?: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    if (!name || !name.trim()) {
      return { success: false, error: 'Category name is required' }
    }
    
    const categoryName = name.trim().toLowerCase().replace(/\s+/g, '-')
    
    // Check if category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { success: false, error: checkError.message }
    }
    
    if (existingCategory) {
      return { success: false, error: 'Category already exists' }
    }
    
    // Insert new category
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        description: description?.trim() || null
      })
      .select()
      .single()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/categories')
    revalidatePath('/admin/prompts')
    
    return { success: true, data }
  } catch (error) {
    console.error('Create category error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function updateCategory(oldCategory: string, newCategory: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    if (!oldCategory || !newCategory) {
      return { success: false, error: 'Both old and new category names are required' }
    }
    
    if (oldCategory === newCategory) {
      return { success: false, error: 'New category name must be different' }
    }
    
    // Update all prompts that use the old category
    const { data, error } = await supabase
      .from('prompts')
      .update({ 
        category: newCategory,
        updated_at: new Date().toISOString()
      })
      .eq('category', oldCategory)
      .select()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/categories')
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true, data: { updated: data.length, category: newCategory } }
  } catch (error) {
    console.error('Update category error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function deleteCategory(category: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    if (!category) {
      return { success: false, error: 'Category name is required' }
    }
    
    // Update all prompts that use this category to remove the category
    const { data, error } = await supabase
      .from('prompts')
      .update({ 
        category: null,
        updated_at: new Date().toISOString()
      })
      .eq('category', category)
      .select()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/categories')
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true, data: { updated: data.length } }
  } catch (error) {
    console.error('Delete category error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

// TAG ACTIONS
export async function getTags(): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Get tags error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function updateTag(oldTag: string, newTag: string, description?: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    if (!oldTag || !newTag) {
      return { success: false, error: 'Both old and new tag names are required' }
    }
    
    const formattedNewTag = newTag.trim().toLowerCase().replace(/\s+/g, '-')
    
    if (oldTag === formattedNewTag) {
      // If only description is changing, update the tags table
      const { data, error } = await supabase
        .from('tags')
        .update({ description: description?.trim() || null })
        .eq('name', oldTag)
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      revalidatePath('/admin/tags')
      return { success: true, data }
    }
    
    // Check if new tag name already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', formattedNewTag)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: checkError.message }
    }
    
    if (existingTag) {
      return { success: false, error: 'A tag with this name already exists' }
    }
    
    // Update the tag in the tags table
    const { data: updatedTag, error: updateTagError } = await supabase
      .from('tags')
      .update({ 
        name: formattedNewTag,
        description: description?.trim() || null
      })
      .eq('name', oldTag)
      .select()
      .single()
    
    if (updateTagError) {
      return { success: false, error: updateTagError.message }
    }
    
    // Get all prompts that contain the old tag
    const { data: prompts, error: fetchError } = await supabase
      .from('prompts')
      .select('id, tags')
      .contains('tags', [oldTag])
    
    if (fetchError) {
      return { success: false, error: fetchError.message }
    }
    
    // Update each prompt's tags array
    for (const prompt of prompts) {
      const updatedTags = prompt.tags.map((tag: string) => tag === oldTag ? formattedNewTag : tag)
      
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ 
          tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }
    
    revalidatePath('/admin/tags')
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true, data: { updated: prompts.length, tag: updatedTag } }
  } catch (error) {
    console.error('Update tag error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function deleteTag(tag: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    if (!tag) {
      return { success: false, error: 'Tag name is required' }
    }
    
    // Get all prompts that contain the tag
    const { data: prompts, error: fetchError } = await supabase
      .from('prompts')
      .select('id, tags')
      .contains('tags', [tag])
    
    if (fetchError) {
      return { success: false, error: fetchError.message }
    }
    
    // Remove the tag from each prompt's tags array
    for (const prompt of prompts) {
      const updatedTags = prompt.tags.filter((t: string) => t !== tag)
      
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ 
          tags: updatedTags.length > 0 ? updatedTags : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }
    
    // Delete the tag from the tags table
    const { error: deleteTagError } = await supabase
      .from('tags')
      .delete()
      .eq('name', tag)
    
    if (deleteTagError) {
      return { success: false, error: deleteTagError.message }
    }
    
    revalidatePath('/admin/tags')
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true, data: { updated: prompts.length } }
  } catch (error) {
    console.error('Delete tag error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

// BULK ACTIONS
export async function bulkUpdatePrompts(ids: string[], updates: Partial<Prompt>): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const { data, error } = await supabase
      .from('prompts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true, data }
  } catch (error) {
    console.error('Bulk update prompts error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function bulkDeletePrompts(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    const { error } = await supabase
      .from('prompts')
      .delete()
      .in('id', ids)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/prompts')
    revalidatePath('/admin')
    revalidatePath('/public')
    
    return { success: true }
  } catch (error) {
    console.error('Bulk delete prompts error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function createTag(name: string, description?: string): Promise<ActionResult> {
  try {
    const { supabase } = await verifyAdminAccess()
    
    if (!name || !name.trim()) {
      return { success: false, error: 'Tag name is required' }
    }
    
    const tagName = name.trim().toLowerCase().replace(/\s+/g, '-')
    
    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { success: false, error: checkError.message }
    }
    
    if (existingTag) {
      return { success: false, error: 'Tag already exists' }
    }
    
    // Insert new tag
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: tagName,
        description: description?.trim() || null
      })
      .select()
      .single()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/tags')
    revalidatePath('/admin/prompts')
    
    return { success: true, data }
  } catch (error) {
    console.error('Create tag error:', error)
    return { success: false, error: 'Internal server error' }
  }
}