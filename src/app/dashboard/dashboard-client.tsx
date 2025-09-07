'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, type Profile } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface DashboardClientProps {
  user: User
  profile: Profile | null
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
    try {
      const result = await updateProfile({ display_name: displayName })
      
      if (result.success) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
        router.refresh()
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/signin')
      router.refresh()
    } catch (err) {
      setError('Failed to sign out')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
      <div className="px-6 py-8 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h3>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false)
                  setDisplayName(profile?.display_name || '')
                  setError('')
                  setMessage('')
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {profile?.display_name || 'Not set'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}