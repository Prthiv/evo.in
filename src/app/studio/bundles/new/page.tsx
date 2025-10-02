import { CuratedBundleForm } from "@/components/admin/curated-bundle-form";
import { getAllProducts } from "@/lib/data-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewBundlePage() {
  const products = await getAllProducts();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Curated Bundle</CardTitle>
        <CardDescription>
          Select products to create a curated bundle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CuratedBundleForm products={products} />
      </CardContent>
    </Card>
  );
}