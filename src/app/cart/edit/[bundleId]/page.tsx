
import { getAllProducts } from "@/lib/data";
import { EditBundlePageClient } from "@/components/cart/edit-bundle-client";

export default async function EditBundlePageLoader({ params }: { params: { bundleId: string }}) {
  const { bundleId } = await params;
  const products = getAllProducts();

  return <EditBundlePageClient products={products} bundleId={bundleId} />;
}
