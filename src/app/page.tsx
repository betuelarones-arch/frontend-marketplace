import Link from 'next/link';
import { Product, ApiResponse, Category } from '@/types/product';
import CategoryFilter from '@/components/CategoryFilter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-marketplace-isa0.onrender.com/api';

async function getProducts(categoryId?: string): Promise<Product[]> {
  try {
    const url = categoryId ? `${API_URL}/products?categoryId=${encodeURIComponent(categoryId)}` : `${API_URL}/products`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data: ApiResponse<Product[]> = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data: ApiResponse<Category[]> = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function HomePage({ searchParams }: { searchParams?: { categoryId?: string } }) {
  const categoryId = searchParams?.categoryId;
  const [products, categories] = await Promise.all([getProducts(categoryId), getCategories()]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Productos</h1>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-slate-600">Filtrar por categoría:</label>
        <CategoryFilter categories={categories} selected={categoryId} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-400">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg hover:shadow-indigo-100/50 transition-shadow"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {product.nombre}
              </h2>
              <p className="text-2xl font-bold text-indigo-600 mb-3">
                S/ {product.precio}
              </p>
              {product.descripcion && (
                <p className="text-slate-500 text-sm line-clamp-2">
                  {product.descripcion}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}