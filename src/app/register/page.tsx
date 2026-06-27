'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/RoleProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3301/api';

export default function RegisterPage() {
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
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Error al registrar');
        return;
      }

      // Backend may return token and user directly after register
      const { token, user } = json.data;
      if (token && user) {
        setAuth(token, user);
        router.push('/');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Registrarse</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-md">{loading ? 'Cargando...' : 'Crear cuenta'}</button>
        </div>
      </form>
    </div>
  );
}
