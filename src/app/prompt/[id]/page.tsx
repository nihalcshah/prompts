import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PromptClient from "./prompt-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch prompt from Supabase
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error || !prompt) {
    notFound();
  }

  return <PromptClient prompt={prompt} />;
}
