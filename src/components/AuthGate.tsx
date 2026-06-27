'use client';

import { useState } from 'react';
import { useRole } from './RoleProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3301/api';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, setAuth, loaded, role } = useRole();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { token: tkn, user } = json.data;
      if (tkn && user) setAuth(tkn, user);
      else setError('Respuesta inválida del servidor');
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Bienvenido</h1>
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
      </div>
    );
  }

  // If token exists, render children normally
  return <>{children}</>;
}
