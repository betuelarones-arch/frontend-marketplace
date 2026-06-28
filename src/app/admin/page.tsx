'use client';

import { useEffect, useState } from 'react';
import { Product, ApiResponse, Category, User } from '@/types/product';
import { useRole } from '@/components/RoleProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-marketplace-isa0.onrender.com/api';

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

  useEffect(() => {
    if (role === 'admin') {
      loadAdminData();
    }
  }, [role]);

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
              <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400" />
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
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Administración de Productos</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Productos</h2>
        {prodLoading ? (
          <div className="text-slate-400">Cargando...</div>
        ) : (
          <div className="mt-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left text-slate-700 font-semibold">Nombre</th>
                  <th className="p-3 text-left text-slate-700 font-semibold">Precio</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-indigo-50/30">
                    <td className="p-3 text-slate-800">{p.nombre}</td>
                    <td className="p-3 text-indigo-600 font-semibold">{p.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Categorías</h2>
        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4">
          <ul>
            {categories.map((c) => (
              <li key={c.id} className="py-1 text-slate-700">{c.nombre}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
