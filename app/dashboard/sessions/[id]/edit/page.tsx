import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EditSessionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!session || error) {
    return <div className="p-6 text-red-600">Failed to load session.</div>;
  }

  // Format date for HTML datetime-local input (YYYY-MM-DDTHH:MM)
  function formatDateTimeForInput(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Get UTC components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function updateSession(formData: FormData) {
    "use server";

    const supabase = createClient();

    // Always save as UTC noon if only date is provided, or preserve time if present
    let dateValue = formData.get("date");
    let dateToSave = null;
    if (dateValue) {
      // If the value is only a date (YYYY-MM-DD), append T12:00:00Z
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue as string)) {
        dateToSave = new Date(dateValue + 'T12:00:00Z').toISOString();
      } else {
        // Otherwise, treat as local datetime and convert to UTC
        dateToSave = new Date(dateValue as string).toISOString();
      }
    }

    const updated = {
      title: formData.get("title"),
      description: formData.get("description"),
      date: dateToSave,
      location: formData.get("location"),
      notes: formData.get("notes"),
    };

    const { error } = await supabase
      .from("sessions")
      .update(updated)
      .eq("id", params.id);

    if (error) {
      console.error("Update failed:", error.message);
      throw new Error("Failed to update session.");
    }

    // Revalidate both the session detail page and the sessions list page
    revalidatePath(`/dashboard/sessions/${params.id}`);
    revalidatePath('/dashboard/sessions');
    
    redirect(`/dashboard/sessions/${params.id}`);
  }

  return (
    <form action={updateSession} className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Edit Session</h1>

      <div className="space-y-1">
        <label htmlFor="title" className="font-medium">Title</label>
        <input
          id="title"
          name="title"
          defaultValue={session.title}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={session.description}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="font-medium">Date and Time</label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          defaultValue={formatDateTimeForInput(session.date)}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="location" className="font-medium">Location</label>
        <input
          id="location"
          name="location"
          defaultValue={session.location}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="font-medium">Notes</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={session.notes}
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
          href={`/dashboard/sessions/${params.id}`}
          className="text-gray-600 hover:underline self-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
} 