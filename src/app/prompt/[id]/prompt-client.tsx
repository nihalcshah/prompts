"use client";

import Link from "next/link";
import { useToast } from "@/components/toast";
import { FaCopy, FaRegCopy } from "react-icons/fa6";
import dynamic from "next/dynamic";

const ShareButton = dynamic(() => import("@/components/share-button"), {
  ssr: false,
});

interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  author: string;
  author_name?: string;
  created_at: string;
  tags?: string[];
}

interface PromptClientProps {
  prompt: Prompt;
}

export default function PromptClient({ prompt }: PromptClientProps) {
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

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Public Prompts
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-neutral-950/80 backdrop-blur-lg rounded-2xl border border-neutral-700/50 overflow-visible">
          {/* Header */}
          <div className="p-8 border-b border-neutral-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {prompt.title}
                </h1>
                <p className="text-lg text-neutral-300 leading-relaxed">
                  {prompt.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <ShareButton
                  title={prompt.title}
                  description={prompt.description}
                  promptId={prompt.id}
                />
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
              <div>by {prompt.author_name || prompt.author}</div>
              <div>
                Created {new Date(prompt.created_at).toLocaleDateString()}
              </div>
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
            <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-100 mb-4">
              Prompt Content
            </h2>
            <div
              onClick={() => copyToClipboard(prompt.content)}
              className="bg-neutral-50 dark:bg-neutral-950/50 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-colors duration-300 group relative"
            >
              <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                {prompt.content}
              </pre>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg> */}
                <FaRegCopy className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
