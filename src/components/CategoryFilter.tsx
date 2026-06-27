'use client';

import { useRouter } from 'next/navigation';
import { Category } from '@/types/product';

export default function CategoryFilter({
  categories,
  selected,
}: {
  categories: Category[];
  selected?: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selected ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        const url = v ? `/?categoryId=${encodeURIComponent(v)}` : '/';
        router.push(url);
      }}
      className="px-3 py-2 border rounded-md"
    >
      <option value="">Todas</option>
      {categories.map((c) => (
        <option key={c.id} value={String(c.id)}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
}
