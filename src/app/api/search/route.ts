
import { db } from '@/lib/db';
import type { Product, ProductFromDB } from '@/lib/types';
import { NextResponse } from 'next/server';

function transformProduct(product: ProductFromDB): Product {
    let imageUrls: string[] = [];
    try {
        imageUrls = JSON.parse(product.images);
    } catch (e) {
        imageUrls = [];
    }

    const tags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : [];

    return {
        id: product.id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        tags: tags,
        isTrending: !!product.isTrending,
        images: imageUrls.map((url, index) => ({
            id: `${product.id}-image-${index}`,
            url: url,
            alt: product.name,
            hint: tags.slice(0, 2).join(' '),
        })),
    };
}


function searchProducts(query: string): Product[] {
    try {
        const stmt = db.prepare(`
            SELECT * FROM products
            WHERE name LIKE ? OR tags LIKE ? OR category LIKE ?
            ORDER BY createdAt DESC
        `);
        const likeQuery = `%${query}%`;
        const dbProducts = stmt.all(likeQuery, likeQuery, likeQuery) as ProductFromDB[];
        return dbProducts.map(transformProduct);
    } catch (error) {
        console.error("Failed to search products:", error);
        return [];
    }
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (typeof q !== 'string') {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = searchProducts(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'An error occurred while searching.' }, { status: 500 });
  }
}
