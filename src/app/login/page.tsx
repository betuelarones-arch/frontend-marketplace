'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/RoleProvider';
 
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-marketplace-isa0.onrender.com/api';
 
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth } = useRole();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
 
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Error al iniciar sesión');
        return;
      }
 
      const { token, user } = json.data;
      setAuth(token, user);
      router.push('/');
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Ingresar</h1>
          <p className="text-slate-500 mt-2">Accedé a tu cuenta para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white shadow-lg shadow-indigo-100/40 border border-slate-200 rounded-xl p-8">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Ingresando...' : 'Ingresar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
