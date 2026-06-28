import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Product, ApiResponse } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-marketplace-isa0.onrender.com/api';

async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const data: ApiResponse<Product> = await res.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function getRelatedProducts(categoryId?: number, excludeId?: number): Promise<Product[]> {
    if (!categoryId) return [];
    try {
        const res = await fetch(`${API_URL}/products?categoryId=${categoryId}`, {
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data: ApiResponse<Product[]> = await res.json();
        return data.success ? data.data.filter(p => p.id !== excludeId).slice(0, 4) : [];
    } catch {
        return [];
    }
}

export default async function ProductDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const related = await getRelatedProducts(product.categoryId, product.id);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
                href="/"
                className="inline-flex items-center gap-1 mb-8 text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
            >
                ← Volver a productos
            </Link>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {product.imageUrl && (
                        <div className="md:w-[400px] shrink-0 aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden">
                            <img
                                src={product.imageUrl}
                                alt={product.nombre}
                                className="w-full h-full md:h-full object-cover"
                            />
                        </div>
                    )}
                    <div className={`p-6 sm:p-8 flex-1 ${!product.imageUrl ? '' : ''}`}>
                        {product.category && (
                            <span className="inline-block mb-3 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                {product.category.nombre}
                            </span>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            {product.nombre}
                        </h1>
                        <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-4">
                            S/ {product.precio}
                        </div>

                        {product.descripcion && (
                            <div className="mb-4">
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {product.descripcion}
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                            ID: {product.id}
                        </div>
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Productos relacionados</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {related.map((rp) => (
                            <Link
                                key={rp.id}
                                href={`/products/${rp.id}`}
                                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-100/50 transition-all"
                            >
                                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                                    {rp.imageUrl ? (
                                        <img
                                            src={rp.imageUrl}
                                            alt={rp.nombre}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900 mb-1 text-sm">{rp.nombre}</h3>
                                    <p className="text-lg font-bold text-indigo-600">S/ {rp.precio}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
