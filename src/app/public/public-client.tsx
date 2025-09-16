"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { GiEmptyHourglass } from "react-icons/gi";
import { useToast } from "@/components/toast";
import dynamic from "next/dynamic";

const ShareButton = dynamic(() => import("@/components/share-button"), {
  ssr: false,
});
interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  categories?: { id: string; name: string; description?: string }[];
  tags?: string[];
  author: string;
  author_name?: string;
  created_at: string;
  prompt_categories?: {
    categories: { id: string; name: string; description?: string };
  }[];
  prompt_tags?: { tags: { id: string; name: string } }[];
}

interface PublicClientProps {
  prompts: Prompt[];
}

export default function PublicClient({ prompts }: PublicClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { showToast, ToastContainer } = useToast();

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast("Prompt copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showToast("Failed to copy prompt", "error");
    }
  };

  useEffect(() => {
    console.log("Client-side prompts:", prompts);
    console.log("First prompt structure:", prompts[0]);
    console.log("First prompt categories:", prompts[0]?.categories);
    console.log("First prompt tags:", prompts[0]?.tags);
  }, [prompts]);
  // Prompts are already transformed on the server side
  const transformedPrompts = prompts;

  // Get unique categories from prompts
  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    transformedPrompts.forEach((prompt) => {
      if (prompt.categories && prompt.categories.length > 0) {
        prompt.categories.forEach((category) => {
          cats.add(category.name);
        });
      }
    });
    return Array.from(cats);
  }, [transformedPrompts]);

  useEffect(() => {
    console.log("transformedPrompts", transformedPrompts);
  }, [transformedPrompts]);
  // console.log(prompts, categories);

  // Filter prompts based on search and category
  const filteredPrompts = useMemo(() => {
    return transformedPrompts.filter((prompt) => {
      const matchesSearch =
        searchTerm === "" ||
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" ||
        (prompt.categories &&
          prompt.categories.some((cat) => cat.name === selectedCategory));

      return matchesSearch && matchesCategory;
    });
  }, [transformedPrompts, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 w-full lg:max-w-xl">
              <div className="flex items-center w-full rounded-2xl border border-neutral-700/50 bg-neutral-950/30 backdrop-blur-sm group focus-within:ring-2 focus-within:ring-white/50 transition-all duration-300">
                <svg
                  className="h-4 w-4 text-neutral-400 ml-4 mr-2"
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
                <input
                  type="text"
                  placeholder="Search prompts, categories, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent text-white placeholder-neutral-400 focus:outline-none transition-all duration-300 text-base"
                />
              </div>
            </div>

            {/* <div className="flex gap-3 flex-wrap justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/50 shadow-lg shadow-blue-500/25"
                      : "bg-neutral-950/40 backdrop-blur-sm text-neutral-300 border-neutral-600/50 hover:bg-neutral-800/60 hover:border-neutral-500/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div> */}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-neutral-400 text-sm">
            {filteredPrompts.length} prompt
            {filteredPrompts.length !== 1 ? "s" : ""} found
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <GiEmptyHourglass className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-300 mb-2">
              No prompts found
            </h3>
            <p className="text-neutral-400 mb-4">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "No public prompts available yet"}
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => copyToClipboard(prompt.content)}
                className="bg-gradient-to-br from-neutral-950/80 to-neutral-800/60 backdrop-blur-xl rounded-2xl border border-neutral-700/30 p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 group relative overflow-visible flex flex-col h-full cursor-pointer"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                {/* Header */}
                <div className="mb-6 relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                      {prompt.title}
                    </h3>
                    <div className="flex-shrink-0">
                      <ShareButton
                        title={prompt.title}
                        description={prompt.description}
                        promptId={prompt.id}
                      />
                    </div>
                  </div>
                  {prompt.categories && prompt.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prompt.categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-block px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 rounded-full border border-purple-500/30 backdrop-blur-sm"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                {prompt.description && (
                  <p className="text-neutral-300 mb-6 line-clamp-2 relative leading-relaxed h-12 flex items-start">
                    {prompt.description}
                  </p>
                )}

                {/* Content Preview */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-neutral-700/30 relative group-hover:bg-black/60 transition-colors duration-300">
                  <p className="text-sm text-neutral-200 line-clamp-3 font-mono leading-relaxed">
                    {prompt.content}
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {prompt.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 rounded-full border border-blue-500/30 backdrop-blur-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="px-3 py-1.5 text-xs font-medium bg-neutral-700/30 text-neutral-400 rounded-full border border-neutral-600/30 backdrop-blur-sm">
                        +{prompt.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-neutral-700/30 relative z-10">
                  <div className="text-sm text-neutral-400 font-medium">
                    {new Date(prompt.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <Link
                    href={`/prompt/${prompt.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    View Details
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
