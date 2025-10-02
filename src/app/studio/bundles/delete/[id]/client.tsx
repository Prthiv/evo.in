'use client'

import { deleteCuratedBundleAction } from "@/lib/actions-async";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTransition } from "react";

export default function DeleteBundleClient({ bundle }: { bundle: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCuratedBundleAction(bundle.id);
      router.push("/studio/bundles");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Bundle</CardTitle>
        <CardDescription>
          Are you sure you want to delete the bundle "{bundle.name}"?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This action cannot be undone. This will permanently delete the bundle.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Yes, Delete Bundle"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}