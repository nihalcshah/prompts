import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCategories, getTags } from '@/app/actions/admin'
import CreatePromptForm from './create-prompt-form'

export const metadata = {
  title: 'Create Prompt - Admin',
  description: 'Create a new prompt in the admin panel',
}

export default async function CreatePromptPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.email !== 'nihalcshah@gmail.com') {
    redirect('/signin?error=unauthorized')
  }

  // Fetch categories and tags for the form
  const [categoriesResult, tagsResult] = await Promise.all([
    getCategories(),
    getTags()
  ])

  const categories = categoriesResult.success ? categoriesResult.data : []
  const tags = tagsResult.success ? tagsResult.data : []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Prompt</h1>
        <p className="text-gray-400">
          Add a new prompt to your collection with categories, tags, and descriptions.
        </p>
      </div>

      <CreatePromptForm 
        categories={categories}
        tags={tags}
      />
    </div>
  )
}