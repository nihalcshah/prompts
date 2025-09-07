import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavigation from './components/admin-navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Double-check admin access (middleware should handle this, but extra security)
  if (error || !user || user.email !== 'nihalcshah@gmail.com') {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminNavigation user={user} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Admin Panel - Prompts',
  description: 'Admin panel for managing prompts, categories, and tags',
}