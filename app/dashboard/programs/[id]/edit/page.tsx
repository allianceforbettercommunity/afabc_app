import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EditProgramPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: program, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!program || error) {
    return <div className="p-6 text-red-600">Failed to load program.</div>;
  }

  // Format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    // Parse the date string and create a new date object
    const date = new Date(dateString);
    // Get the local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Return in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  };

  console.log("Program start date:", program.startDate);
  console.log("Formatted start date:", formatDateForInput(program.startDate));
  console.log("Program end date:", program.endDate);
  console.log("Formatted end date:", formatDateForInput(program.endDate));

  async function updateProgram(formData: FormData) {
    "use server";

    const supabase = createClient();

    // Create dates at noon UTC to avoid timezone issues
    const startDate = formData.get("startDate") 
      ? new Date(formData.get("startDate") + 'T12:00:00Z').toISOString() 
      : null;
    const endDate = formData.get("endDate") 
      ? new Date(formData.get("endDate") + 'T12:00:00Z').toISOString() 
      : null;

    console.log("Form start date:", formData.get("startDate"));
    console.log("Processed start date:", startDate);
    console.log("Form end date:", formData.get("endDate"));
    console.log("Processed end date:", endDate);

    const updated = {
      title: formData.get("title"),
      description: formData.get("description"),
      startDate,
      endDate,
    };

    const { error } = await supabase
      .from("programs")
      .update(updated)
      .eq("id", params.id);

    if (error) {
      console.log("Updating program with:", updated);
      console.error("Update failed:", error.message);
      throw new Error("Failed to update program.");
    }

    // Revalidate both the program detail page and the programs list page
    revalidatePath(`/dashboard/programs/${params.id}`);
    revalidatePath('/dashboard/programs');
    
    redirect(`/dashboard/programs/${params.id}`);
  }

  return (
    <form action={updateProgram} className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Edit Program</h1>

      <div className="space-y-1">
        <label htmlFor="title" className="font-medium">Title</label>
        <input
          id="title"
          name="title"
          defaultValue={program.title}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={program.description}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="font-medium">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            defaultValue={formatDateForInput(program.startDate)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="font-medium">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            defaultValue={formatDateForInput(program.endDate)}
            className="w-full border border-gray-300 p-2 rounded"
          />
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
          href={`/dashboard/programs/${params.id}`}
          className="text-gray-600 hover:underline self-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
