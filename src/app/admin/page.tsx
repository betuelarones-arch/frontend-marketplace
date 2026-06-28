'use client';

import { useEffect, useState } from 'react';
import { Product, ApiResponse, Category, User } from '@/types/product';
import { useRole } from '@/components/RoleProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-marketplace-isa0.onrender.com/api';

interface ProductForm {
  nombre: string;
  precio: string;
  descripcion: string;
  imageUrl: string;
  categoryId: string;
}

const emptyForm: ProductForm = { nombre: '', precio: '', descripcion: '', imageUrl: '', categoryId: '' };

export default function AdminPage() {
  const { token, setAuth, user, role } = useRole();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prodLoading, setProdLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      loadAdminData();
    }
  }, [role]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const loadAdminData = async () => {
    setProdLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
      ]);
      const pJson: ApiResponse<Product[]> = await pRes.json();
      const cJson: ApiResponse<Category[]> = await cRes.json();
      if (pJson?.success) setProducts(pJson.data);
      if (cJson?.success) setCategories(cJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProdLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      nombre: p.nombre,
      precio: String(p.precio),
      descripcion: p.descripcion || '',
      imageUrl: p.imageUrl || '',
      categoryId: p.categoryId ? String(p.categoryId) : '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const body = {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion || undefined,
        imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      };

      const isEdit = editingProduct;
      const url = isEdit ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.message || 'Error al guardar');
        return;
      }

      setShowModal(false);
      loadAdminData();
    } catch {
      setFormError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) return;
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSavingCategory(true);
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nombre: categoryName }),
      });
      if (res.ok) {
        setShowCategoryModal(false);
        setCategoryName('');
        loadAdminData();
      }
    } catch {
      console.error('Error creating category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleAuth = async (action: 'login' | 'register') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Error');
        return;
      }

      const { token: tkn, user: usr } = json as { token?: string; user?: User };
      if (tkn && usr) {
        setAuth(tkn, usr);
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token || role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Acceso de administrador</h1>
            <p className="text-slate-500 mt-2">Iniciá sesión con una cuenta admin</p>
          </div>
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setMode('login')} className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              Ingresar
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              Registrarse
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAuth(mode); }} className="space-y-5 bg-white shadow-lg shadow-indigo-100/40 p-8 border border-slate-200 rounded-xl">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900" />
            </div>
            <div>
              <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Administración</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowCategoryModal(true)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium">
            + Categoría
          </button>
          <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium">
            + Producto
          </button>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Productos</h2>
        {prodLoading ? (
          <div className="text-slate-400">Cargando...</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left text-slate-700 font-semibold text-sm">Nombre</th>
                  <th className="p-3 text-left text-slate-700 font-semibold text-sm">Precio</th>
                  <th className="p-3 text-left text-slate-700 font-semibold text-sm">Categoría</th>
                  <th className="p-3 text-left text-slate-700 font-semibold text-sm">Imagen</th>
                  <th className="p-3 text-right text-slate-700 font-semibold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">No hay productos</td></tr>
                ) : products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-indigo-50/30">
                    <td className="p-3 text-slate-800 font-medium">{p.nombre}</td>
                    <td className="p-3 text-indigo-600 font-semibold">S/ {p.precio}</td>
                    <td className="p-3 text-slate-600">{p.category?.nombre || <span className="text-slate-300">—</span>}</td>
                    <td className="p-3 text-slate-600">{p.imageUrl ? <span className="text-xs text-indigo-500">✔</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Categorías</h2>
        {categories.length === 0 ? (
          <div className="text-slate-400">No hay categorías</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                {c.nombre}
              </span>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              {formError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                <input required type="number" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-900 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de imagen</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-900 bg-white">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Nueva categoría</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ej: Electrónicos" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium">Cancelar</button>
                <button type="submit" disabled={savingCategory} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium disabled:opacity-60">{savingCategory ? 'Guardando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
