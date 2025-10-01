
import { getAllProducts } from '@/lib/data-async';
import { Categories } from '@/components/categories';
import { CuratedBundles } from '@/components/curated-bundles';
import { ProductCard } from '@/components/product-card';
import { SelectionTray } from '@/components/selection-tray';

export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const resolvedSearchParams = searchParams;
  const currentCategory = resolvedSearchParams?.category;
  const allProducts = await getAllProducts();

  const filteredProducts = currentCategory
    ? allProducts.filter((p) => p.category === currentCategory)
    : allProducts;

  const isAllProductsPage = !currentCategory;

  return (
    <div className="container py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
          {currentCategory?.replace(/ FRAMES AND WALLPOSTERS| FRAMES AND POSTERS/g, "") || "All Products"}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Discover our curated collection of high-quality posters and frames. Select at least 6 to build your bundle.
        </p>
      </header>
      
      <Categories isProductsPage={true} />

      {isAllProductsPage && (
        <div className="my-12">
            <CuratedBundles products={allProducts} />
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-headline">No Products Found</h2>
          <p className="text-muted-foreground mt-2">
            There are no products available in this category.
          </p>
        </div>
      )}
      <SelectionTray />
    </div>
  );
}
