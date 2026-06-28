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
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-100/50 transition-all"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  {product.nombre}
                </h2>
                <p className="text-xl font-bold text-indigo-600 mb-2">
                  S/ {product.precio}
                </p>
                {product.descripcion && (
                  <p className="text-slate-500 text-sm line-clamp-2">
                    {product.descripcion}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}