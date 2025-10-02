import { CuratedBundleForm } from "@/components/admin/curated-bundle-form";
import { getAllProducts, getCuratedBundleById } from "@/lib/data-async";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params as required by Next.js
  const { id } = await params;
  const [bundle, products] = await Promise.all([
    getCuratedBundleById(id),
    getAllProducts()
  ]);

  if (!bundle) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Bundle</CardTitle>
        <CardDescription>
          Update the details for "{bundle.name}".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CuratedBundleForm bundle={bundle} products={products} />
      </CardContent>
    </Card>
  );
}