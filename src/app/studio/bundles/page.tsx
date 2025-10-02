import { getAllCuratedBundles } from "@/lib/data-async";
import { CuratedBundlesTable } from "@/components/admin/curated-bundles-table";
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

export default async function StudioBundlesPage() {
  const bundles = await getAllCuratedBundles();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Curated Bundles</CardTitle>
            <CardDescription>
              Manage your curated product bundles.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/studio/bundles/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Bundle
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CuratedBundlesTable data={bundles} />
      </CardContent>
    </Card>
  );
}