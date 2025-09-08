import { getPrompts, getCategories, getTags } from "@/app/actions/admin";
import PromptsClient from "./prompts-client";
import Link from "next/link";

interface SearchParams {
  search?: string;
  category?: string;
  tag?: string;
  filter?: "public" | "private";
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PromptsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Build filters
  const filters: any = {};
  if (params.search) filters.search = params.search;
  if (params.category) filters.category = params.category;
  if (params.tag) filters.tag = params.tag;
  if (params.filter === "public") filters.isPublic = true;
  if (params.filter === "private") filters.isPublic = false;

  // Fetch data
  const [promptsResult, categoriesResult, tagsResult] = await Promise.all([
    getPrompts(filters),
    getCategories(),
    getTags(),
  ]);

  if (!promptsResult.success) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">
              Error loading prompts: {promptsResult.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const prompts = promptsResult.data || [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const tags = tagsResult.success ? tagsResult.data : [];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Prompts Management
            </h1>
            <p className="text-neutral-400">
              Create, edit, and manage your prompts collection.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/admin/prompts/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <span className="mr-2">➕</span>
              Create New Prompt
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💬</span>
              <div>
                <p className="text-sm text-neutral-400">Total Prompts</p>
                <p className="text-xl font-bold text-white">{prompts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌐</span>
              <div>
                <p className="text-sm text-neutral-400">Public</p>
                <p className="text-xl font-bold text-white">
                  {prompts.filter((p: any) => p.is_public).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔒</span>
              <div>
                <p className="text-sm text-neutral-400">Private</p>
                <p className="text-xl font-bold text-white">
                  {prompts.filter((p: any) => !p.is_public).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Component for Interactive Features */}
        <PromptsClient
          initialPrompts={prompts}
          categories={categories}
          tags={tags}
          initialFilters={params}
        />
      </div>
    </div>
  );
}
