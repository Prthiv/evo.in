
import { getAllProducts } from "@/lib/data";
import { EditBundlePageClient } from "@/components/cart/edit-bundle-client";

export default function EditBundlePageLoader({ params }: { params: { bundleId: string }}) {
  const products = getAllProducts();

  return <EditBundlePageClient products={products} bundleId={params.bundleId} />;
}
