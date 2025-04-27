import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EditParentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: parent, error } = await supabase
    .from("parents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!parent || error) {
    return <div className="p-6 text-red-600">Failed to load person.</div>;
  }

  async function updateParent(formData: FormData) {
    "use server";

    const supabase = createClient();

    const updated = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      childrenInfo: formData.get("childrenInfo"),
      notes: formData.get("notes"),
    };

    const { error } = await supabase
      .from("parents")
      .update(updated)
      .eq("id", params.id);

    if (error) {
      console.error("Update failed:", error.message);
      throw new Error("Failed to update person.");
    }

    // Revalidate both the parent detail page and the parents list page
    revalidatePath(`/dashboard/parents/${params.id}`);
    revalidatePath('/dashboard/parents');
    
    redirect(`/dashboard/parents/${params.id}`);
  }

  return (
    <form action={updateParent} className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Edit Person</h1>

      <div className="space-y-1">
        <label htmlFor="name" className="font-medium">Name</label>
        <input
          id="name"
          name="name"
          defaultValue={parent.name}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={parent.email}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="font-medium">Phone</label>
        <input
          id="phone"
          name="phone"
          defaultValue={parent.phone}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="address" className="font-medium">Address</label>
        <input
          id="address"
          name="address"
          defaultValue={parent.address}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="childrenInfo" className="font-medium">Information</label>
        <textarea
          id="childrenInfo"
          name="childrenInfo"
          defaultValue={parent.childrenInfo}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="font-medium">Notes</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={parent.notes}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
        <a
          href={`/dashboard/parents/${params.id}`}
          className="text-gray-600 hover:underline self-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
} 