'use client';

import { useState } from 'react';
import { useRole } from './RoleProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-marketplace-isa0.onrender.com/api';

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
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Bienvenido</h1>
            <p className="text-slate-500 mt-2">Iniciá sesión o creá una cuenta</p>
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

  return <>{children}</>;
}
