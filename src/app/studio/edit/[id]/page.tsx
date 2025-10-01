
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

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
        <ProductForm product={product} />
      </CardContent>
    </Card>
  );
}
