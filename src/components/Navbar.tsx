'use client';

import Link from 'next/link';
import RoleSelector from './RoleSelector';
import { useRole } from './RoleProvider';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const { token, user, logout } = useRole();
    const router = useRouter();
    const pathname = usePathname();

    if (pathname === '/login' || pathname === '/register') return null;

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center h-16">
                    <Link href="/" className="text-xl font-semibold text-indigo-600">
                        ProductStore
                    </Link>
                    <div className="flex gap-6">
                        <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
                            Productos
                        </Link>
                        {token && user?.role === 'admin' && (
                            <Link href="/admin" className="text-slate-600 hover:text-indigo-600 transition-colors">
                                Admin
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <RoleSelector />
                        {token ? (
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-600">{user?.email}</div>
                                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Cerrar sesión</button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <a href="/login" className="text-sm text-slate-600 hover:text-indigo-600">Ingresar</a>
                                <a href="/register" className="text-sm text-slate-600 hover:text-indigo-600">Registrarse</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};