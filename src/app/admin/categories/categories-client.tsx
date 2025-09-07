'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CategoriesClientProps {
  categories: string[]
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(filteredCategories)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedCategories.length === 0) return
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedCategories.length} categories? This will remove the category from all associated prompts.`)
    if (!confirmed) return

    setIsLoading(true)
    try {
      const { deleteCategory } = await import('@/app/actions/admin')
      
      for (const category of selectedCategories) {
        const result = await deleteCategory(category)
        if (!result.success) {
          throw new Error(result.error)
        }
      }
      
      setSelectedCategories([])
      router.refresh()
    } catch (error) {
      console.error('Error deleting categories:', error)
      alert('Failed to delete categories: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-700 bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ({selectedCategories.length})
            </button>
          </div>
        )}
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? `No categories match "${searchTerm}"`
              : 'Create your first category to organize your prompts'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => router.push('/admin/categories/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Create Category
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
            <input
              type="checkbox"
              checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">
              {selectedCategories.length === filteredCategories.length && filteredCategories.length > 0
                ? 'Deselect all'
                : `Select all (${filteredCategories.length})`
              }
            </span>
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-900/30 border-blue-500/50 ring-1 ring-blue-500/30'
                    : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600'
                }`}
                onClick={() => handleSelectCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleSelectCategory(category)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h3 className="font-medium text-white">{category}</h3>
                      <p className="text-sm text-gray-400">Category</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/categories/${encodeURIComponent(category)}/edit`)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                      title="Edit category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}