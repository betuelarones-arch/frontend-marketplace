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

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
                href="/"
                className="inline-flex items-center gap-1 mb-8 text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
            >
                ← Volver a productos
            </Link>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {product.imageUrl && (
                    <div className="aspect-[2/1] bg-slate-100 overflow-hidden">
                        <img
                            src={product.imageUrl}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            {product.nombre}
                        </h1>
                        <div className="text-3xl sm:text-4xl font-bold text-indigo-600 shrink-0">
                            S/ {product.precio}
                        </div>
                    </div>

                    {product.category && (
                        <span className="inline-block mb-6 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                            {product.category.nombre}
                        </span>
                    )}

                    {product.descripcion && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-3">
                                Descripción
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-base">
                                {product.descripcion}
                            </p>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-200 text-sm text-slate-400">
                        ID del producto: {product.id}
                    </div>
                </div>
            </div>
        </div>
    );
}
