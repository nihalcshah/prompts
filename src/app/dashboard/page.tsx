import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile, upsertProfile } from '@/app/actions/profile'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/signin')
  }

  // Ensure user profile exists (upsert on first login)
  const profileResult = await upsertProfile()
  
  if (!profileResult.success) {
    console.error('Failed to upsert profile:', profileResult.error)
  }

  // Get the current profile
  const currentProfileResult = await getCurrentProfile()
  const profile = currentProfileResult.success ? currentProfileResult.profile : null

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-700 pb-5">
            <h1 className="text-3xl font-bold leading-6 text-white">
              Dashboard
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-300">
              Welcome to your dashboard. Manage your profile and account settings.
            </p>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back, {profile?.display_name || user.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="mt-2 text-gray-300">
              Manage your prompts and explore the community.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <DashboardClient user={user} profile={profile || null} />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg overflow-hidden shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="px-6 py-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="/public"
                      className="group p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Explore Prompts
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Discover amazing prompts from the community
                      </p>
                    </a>

                    <a
                      href="/admin/prompts/new"
                      className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Create Prompt
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Share your creative prompts with others
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}