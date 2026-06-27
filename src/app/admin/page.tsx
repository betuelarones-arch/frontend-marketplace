'use client';

import { useEffect, useState } from 'react';
import { Product, ApiResponse, Category, User } from '@/types/product';
import { useRole } from '@/components/RoleProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3301/api';

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
    // show login/register first
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Acceso de administrador</h1>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('login')} className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-gray-900 text-white' : 'bg-white border'}`}>
            Ingresar
          </button>
          <button onClick={() => setMode('register')} className={`px-4 py-2 rounded ${mode === 'register' ? 'bg-gray-900 text-white' : 'bg-white border'}`}>
            Registrarse
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(mode); }} className="space-y-4 bg-white p-6 border rounded">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <button className="w-full bg-gray-900 text-white py-2 rounded">{loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
          </div>
        </form>
      </div>
    );
  }

  // Admin UI when authenticated as admin
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Administración de Productos</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Productos</h2>
        {prodLoading ? (
          <div className="text-gray-500">Cargando...</div>
        ) : (
          <div className="mt-4 bg-white border rounded">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Precio</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b"><td className="p-3">{p.nombre}</td><td className="p-3">{p.precio}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Categorías</h2>
        <div className="mt-4 bg-white border rounded p-4">
          <ul>
            {categories.map((c) => (
              <li key={c.id} className="py-1">{c.nombre}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
