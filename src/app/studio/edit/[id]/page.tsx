
import { EnhancedProductForm } from "@/components/admin/enhanced-product-form";
import { getProductById } from "@/lib/data-async";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
        <CardDescription>
          Update the details for "{product.name}".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnhancedProductForm product={product} />
      </CardContent>
    </Card>
  );
}
