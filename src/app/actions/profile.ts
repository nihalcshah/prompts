'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export interface Profile {
  id: string
  user_id: string
  display_name?: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

/**
 * Edge-safe server action to upsert user profiles on first login
 * Uses auth.getUser() server-side for secure user verification
 */
export async function upsertProfile(): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      return { success: false, error: 'Failed to check existing profile' }
    }

    // If profile exists, return it
    if (existingProfile) {
      return { success: true, profile: existingProfile }
    }

    // Create new profile for first-time login
    const newProfile = {
      user_id: user.id,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .upsert(newProfile, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: `Failed to create profile: ${insertError.message}` }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Profile upsert error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action to update an existing profile
 */
export async function updateProfile(updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: `Failed to update profile: ${updateError.message}` }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action to get current user profile
 */
export async function getCurrentProfile(): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return { success: false, error: `Failed to fetch profile: ${fetchError.message}` }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Profile fetch error:', error)
    return { success: false, error: 'Internal server error' }
  }
}