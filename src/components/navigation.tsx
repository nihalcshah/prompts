"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

interface NavigationProps {
  initialUser?: User | null;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function Navigation({ initialUser }: NavigationProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Ensure we're on the client side before doing any client-specific operations
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only run client-side user fetching if we don't have an initial user
    // and we're confirmed to be on the client
    if (!isHydrated) return;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    if (!initialUser) {
      getUser();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, initialUser, isHydrated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isHydrated) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isHydrated]);

  // Fetch categories
  useEffect(() => {
    if (!isHydrated) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [isHydrated]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setIsLoading(false);
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Render consistent content during hydration
  if (!isHydrated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-semibold text-white hover:text-neutral-300 transition-colors duration-200"
              >
                Nihal&apos;s Prompts
              </Link>
            </div>

            {/* Search Bar */}
            {/* <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg bg-neutral-950/50 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-colors duration-200 text-sm"
                />
              </div>
            </div> */}

            {/* User Menu - Show based on initialUser */}
            <div className="flex items-center space-x-4">
              {initialUser ? (
                <div className="relative">
                  <button className="flex items-center space-x-2 hover:bg-neutral-800/50 rounded-lg px-3 py-2 transition-colors duration-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(initialUser.email || "U")}
                    </div>
                    <span className="hidden sm:block text-sm text-neutral-300">
                      {initialUser.email}
                    </span>
                    <svg
                      className="w-4 h-4 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  className="bg-white text-neutral-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden border-t border-neutral-800 bg-black/90">
          <div className="px-4 py-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search prompts..."
                className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg bg-neutral-950/50 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-colors duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories Bar with Admin Items */}
        <div className="border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-3 overflow-x-auto">
              <Link
                href="/"
                className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                All Prompts
              </Link>
              {initialUser && (
                <>
                  <div className="w-px h-4 bg-neutral-600 mx-4"></div>
                  <Link
                    href="/admin"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/prompts"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                  >
                    Prompts
                  </Link>
                  <Link
                    href="/admin/categories"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/admin/tags"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                  >
                    Tags
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-semibold text-white hover:text-neutral-300 transition-colors duration-200"
            >
              Nihal&apos;s Prompts
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar - Clickable */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-neutral-800/50 rounded-lg px-3 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(user.email || "U")}
                  </div>
                  <span className="hidden sm:block text-sm text-neutral-300">
                    {user.email}
                  </span>
                  <svg
                    className="w-4 h-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-950 border border-neutral-700 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Dashboard
                      </Link>
                      <hr className="border-neutral-700 my-2" />
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleSignOut();
                        }}
                        disabled={isLoading}
                        className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200 disabled:opacity-50"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {isLoading ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="bg-white text-neutral-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories Bar with Admin Items */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3 overflow-x-auto">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap"
            >
              All Prompts
            </Link>
            {user && (
              <>
                <div className="w-px h-4 bg-neutral-600 mx-4"></div>
                <Link
                  href="/admin"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/prompts"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                >
                  Prompts
                </Link>
                <Link
                  href="/admin/categories"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                >
                  Categories
                </Link>
                <Link
                  href="/admin/tags"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
                >
                  Tags
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
