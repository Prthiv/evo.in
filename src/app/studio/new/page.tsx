
import { EnhancedProductForm } from "@/components/admin/enhanced-product-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>
          Fill in the details below to add a new product to your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnhancedProductForm />
      </CardContent>
    </Card>
  );
}
