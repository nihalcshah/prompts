import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CreateTagForm from "./create-tag-form";

export const metadata = {
  title: "Create Tag - Admin",
  description: "Create a new tag in the admin panel",
};

export default async function CreateTagPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Create New Tag</h1>
          <p className="text-neutral-400">
            Add a new tag to label and organize your prompts. Tags help users
            find specific types of content.
          </p>
        </div>

        <CreateTagForm />
      </div>
    </div>
  );
}
