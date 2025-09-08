import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CreateCategoryForm from "./create-category-form";

export const metadata = {
  title: "Create Category - Admin",
  description: "Create a new category in the admin panel",
};

export default async function CreateCategoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "nihalcshah@gmail.com") {
    redirect("/signin?error=unauthorized");
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create New Category
          </h1>
          <p className="text-neutral-400">
            Add a new category to organize your prompts. Categories help users
            find and filter content.
          </p>
        </div>

        <CreateCategoryForm />
      </div>
    </div>
  );
}
