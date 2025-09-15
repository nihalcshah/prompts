import { createClient } from '@/utils/supabase/server'
import PublicClient from './public/public-client'

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch public prompts from Supabase with categories and tags
  const { data: prompts } = await supabase
    .from("prompts")
    .select(
      `
      *,
      prompt_categories(
        categories(
          id,
          name,
          description
        )
      ),
      prompt_tags(
        tags(
          id,
          name
        )
      )
    `
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  console.log("Public prompts with categories and tags:", JSON.stringify(prompts, null, 2));
  
  // Transform and flatten the data for client component
  const transformedPrompts = (prompts || []).map((prompt) => ({
    ...prompt,
    categories: prompt.prompt_categories?.map((pc: any) => pc.categories) || [],
    tags: prompt.prompt_tags?.map((pt: any) => pt.tags.name) || [],
  }));
  
  return <PublicClient prompts={transformedPrompts} />
}
