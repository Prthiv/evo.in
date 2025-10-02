import { getAllCategories } from "@/lib/data-async";
import { CategoriesTable } from "@/components/admin/categories-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function StudioCategoriesPage() {
  const categories = await getAllCategories();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage your product categories and their visibility.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/studio/categories/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CategoriesTable data={categories} />
      </CardContent>
    </Card>
  );
}