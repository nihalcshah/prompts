import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import EditTagForm from "./edit-tag-form";

export const metadata = {
  title: "Edit Tag - Admin",
  description: "Edit tag in the admin panel",
};

interface EditTagPageProps {
  params: {
    name: string;
  };
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "nihalcshah@gmail.com") {
    redirect("/signin?error=unauthorized");
  }

  const tagName = decodeURIComponent(params.name);

  // Check if tag exists in the tags table
  const { data: tag, error } = await supabase
    .from("tags")
    .select("id")
    .eq("name", tagName)
    .single();

  if (error) {
    console.error("Error checking tag:", error);
    redirect("/admin/tags?error=database");
  }

  if (!tag) {
    redirect("/admin/tags?error=not-found");
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Tag</h1>
          <p className="text-neutral-400">
            Update the tag name and description. This will affect all prompts
            using this tag.
          </p>
        </div>

        <EditTagForm currentTag={tagName} />
      </div>
    </div>
  );
}
