import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPrompt, getCategories, getTags } from "@/app/actions/admin";
import EditPromptForm from "./edit-prompt-form";

export const metadata = {
  title: "Edit Prompt - Admin",
  description: "Edit prompt in the admin panel",
};

interface EditPromptPageProps {
  params: {
    id: string;
  };
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  // Await params before using its properties
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=unauthorized");
  }

  // Fetch prompt data and categories/tags
  const [promptResult, categoriesResult, tagsResult] = await Promise.all([
    getPrompt(id), // Use the awaited id instead of params.id
    getCategories(),
    getTags(),
  ]);

  if (!promptResult.success) {
    redirect("/admin/prompts");
  }

  const prompt = promptResult.data;
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const tags = tagsResult.success ? tagsResult.data : [];

  // Debug logging
  console.log('Edit page - prompt data:', JSON.stringify(prompt, null, 2));
  console.log('Edit page - categories:', categories);
  console.log('Edit page - prompt categories:', prompt?.categories);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Prompt</h1>
        <p className="text-neutral-400">
          Update your prompt with new content, categories, tags, and
          descriptions.
        </p>
      </div>

      <EditPromptForm prompt={prompt} categories={categories} tags={tags} />
    </div>
  );
}
