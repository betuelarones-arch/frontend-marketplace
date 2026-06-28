'use client';

import { ReactNode } from 'react';
import { useRole } from './RoleProvider';
import { useRouter } from 'next/navigation';

interface RoleGateProps {
  allowed: Array<'customer' | 'admin'>;
  children: ReactNode;
}

export default function RoleGate({ allowed, children }: RoleGateProps) {
  const { role, loaded } = useRole();
  const router = useRouter();

  if (!loaded) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Cargando rol...</div>;
  }

  if (!role || !allowed.includes(role)) {
    if (typeof window !== 'undefined') {
      router.replace('/');
    }
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">Acceso no autorizado.</div>;
  }

  return <>{children}</>;
}
