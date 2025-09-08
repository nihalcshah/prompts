import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import EditCategoryForm from "./edit-category-form";

export const metadata = {
  title: "Edit Category - Admin",
  description: "Edit category in the admin panel",
};

interface EditCategoryPageProps {
  params: {
    name: string;
  };
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "nihalcshah@gmail.com") {
    redirect("/signin?error=unauthorized");
  }

  const categoryName = decodeURIComponent(params.name);

  // Verify the category exists by checking if any prompts use it
  const { data: prompts } = await supabase
    .from("prompts")
    .select("id")
    .eq("category", categoryName)
    .limit(1);

  if (!prompts || prompts.length === 0) {
    redirect("/admin/categories");
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Category</h1>
          <p className="text-neutral-400">
            Update the category name. This will affect all prompts using this
            category.
          </p>
        </div>

        <EditCategoryForm currentCategory={categoryName} />
      </div>
    </div>
  );
}
