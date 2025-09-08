import { createClient } from "@/utils/supabase/server";
import PublicClient from "./public-client";

export default async function PublicPage() {
  const supabase = await createClient();

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

  return <PublicClient prompts={prompts || []} />;
}
