import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export default async function EditIssuePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: issue, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!issue || error) {
    return <div className="p-6 text-red-600">Failed to load issue.</div>;
  }

  async function updateIssue(formData: FormData) {
    "use server";

    const supabase = createClient();

    const updated = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      status: formData.get("status"),
      priority: formData.get("priority"),
    };

    const { error } = await supabase
      .from("issues")
      .update(updated)
      .eq("id", params.id);

    if (error) {
      console.error("Update failed:", error.message);
      throw new Error("Failed to update issue.");
    }

    redirect(`/dashboard/issues/${params.id}`);
  }

  return (
    <form action={updateIssue} className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Edit Issue</h1>

      <div className="space-y-1">
        <label htmlFor="title" className="font-medium">Title</label>
        <input
          id="title"
          name="title"
          defaultValue={issue.title}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={issue.description}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="category" className="font-medium">Category</label>
        <input
          id="category"
          name="category"
          defaultValue={issue.category}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="font-medium">Status</label>
          <select
            name="status"
            defaultValue={issue.status}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="font-medium">Priority</label>
          <select
            name="priority"
            defaultValue={issue.priority}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
        <a
          href={`/dashboard/issues/${params.id}`}
          className="text-gray-600 hover:underline self-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
