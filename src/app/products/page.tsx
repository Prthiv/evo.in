import { getAllProducts, getVisibleCategories } from "@/lib/data-async";
import { ProductCard } from "@/components/product-card";
import { Categories } from "@/components/categories";
import { Suspense } from "react";

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const products = await getAllProducts();
  const categories = await getVisibleCategories();
  
  const filteredProducts = searchParams.category 
    ? products.filter(product => product.category === searchParams.category)
    : products;

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Our Products</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Discover our premium collection of posters and frames.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading categories...</div>}>
        <Categories isProductsPage={true} categories={categories} />
      </Suspense>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No products found</h3>
          <p className="text-muted-foreground mt-2">
            Try selecting a different category or check back later.
          </p>
        </div>
      )}
    </div>
  );
}