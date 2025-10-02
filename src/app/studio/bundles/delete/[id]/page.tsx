import { getCuratedBundleById } from "@/lib/data-async";
import { notFound } from "next/navigation";
import DeleteBundleClient from "./client";

export default async function DeleteBundlePage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params as required by Next.js
  const { id } = await params;
  const bundle = await getCuratedBundleById(id);

  if (!bundle) {
    notFound();
  }

  return <DeleteBundleClient bundle={bundle} />;
}