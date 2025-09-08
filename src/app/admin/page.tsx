import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get statistics
  const [promptsResult, categoriesResult, publicPromptsResult] =
    await Promise.all([
      supabase.from("prompts").select("id", { count: "exact", head: true }),
      supabase.from("prompts").select("category").not("category", "is", null),
      supabase
        .from("prompts")
        .select("id", { count: "exact", head: true })
        .eq("is_public", true),
    ]);

  const totalPrompts = promptsResult.count || 0;
  const publicPrompts = publicPromptsResult.count || 0;
  const privatePrompts = totalPrompts - publicPrompts;

  // Get unique categories
  const uniqueCategories = new Set(
    categoriesResult.data?.map((p) => p.category).filter(Boolean)
  );
  const totalCategories = uniqueCategories.size;

  const stats = [
    {
      name: "Total Prompts",
      value: totalPrompts,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      href: "/admin/prompts",
      color: "from-slate-700 to-slate-800",
    },
    {
      name: "Public Prompts",
      value: publicPrompts,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: "/admin/prompts?filter=public",
      color: "from-slate-600 to-slate-700",
    },
    {
      name: "Private Prompts",
      value: privatePrompts,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      href: "/admin/prompts?filter=private",
      color: "from-slate-500 to-slate-600",
    },
    {
      name: "Categories",
      value: totalCategories,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      href: "/admin/categories",
      color: "from-slate-400 to-slate-500",
    },
  ];

  const quickActions = [
    {
      name: "Create New Prompt",
      description: "Add a new prompt to the collection",
      href: "/admin/prompts/new",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
      color: "from-indigo-600 to-indigo-700",
    },
    {
      name: "Manage Categories",
      description: "Organize prompts by categories",
      href: "/admin/categories",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600",
    },
    {
      name: "Manage Tags",
      description: "Create and organize tags",
      href: "/admin/tags",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      color: "from-indigo-400 to-indigo-500",
    },
    {
      name: "View Public Site",
      description: "See how prompts appear to users",
      href: "/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      color: "from-slate-600 to-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-neutral-400">
            Manage your prompts, categories, and tags from this central hub.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href} className="group block">
              <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/50 transition-all duration-300 group-hover:scale-105 hover:bg-neutral-900/70">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}
                  >
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="group block"
              >
                <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/50 transition-all duration-300 group-hover:scale-105 hover:bg-neutral-900/70">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} text-white mb-4`}
                  >
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-neutral-300 mb-2">
                    {action.name}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
