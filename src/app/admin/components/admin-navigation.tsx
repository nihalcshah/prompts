'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AdminNavigationProps {
  user: User
}

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/signin')
      router.refresh()
    } catch (err) {
      console.error('Failed to sign out:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Prompts', href: '/admin/prompts', icon: '💬' },
    { name: 'Categories', href: '/admin/categories', icon: '📁' },
    { name: 'Tags', href: '/admin/tags', icon: '🏷️' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/admin" className="text-xl font-bold text-white hover:text-gray-300 transition-colors duration-200">
              🔧 Admin Panel
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {user.email}
                </span>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-t border-gray-800">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-700 pt-4">
              <div className="px-3 py-2 text-sm text-gray-300">
                {user.email}
              </div>
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleSignOut()
                }}
                disabled={isLoading}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}