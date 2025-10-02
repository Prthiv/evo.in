import { getCategoryById } from "@/lib/data-async";
import { notFound } from "next/navigation";
import DeleteCategoryClient from "./client";

export default async function DeleteCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params as required by Next.js
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return <DeleteCategoryClient category={category} />;
}