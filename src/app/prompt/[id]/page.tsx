import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PromptPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch prompt from Supabase
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error || !prompt) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/public"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Public Prompts
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {prompt.title}
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {prompt.description}
                </p>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div>by {prompt.author_name || prompt.author}</div>
              <div>Created {new Date(prompt.created_at).toLocaleDateString()}</div>
            </div>

            {/* Tags */}
            {prompt.tags && (
              <div className="flex flex-wrap gap-2 mt-6">
                {prompt.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Content */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Prompt Content
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Prompt
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const supabase = await createClient()
  
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id')
    .eq('is_public', true)
  
  return prompts?.map((prompt) => ({ id: prompt.id.toString() })) || []
}