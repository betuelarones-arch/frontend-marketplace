'use client';

import { useRole, UserRole } from './RoleProvider';

const options: { label: string; value: UserRole }[] = [
  { label: 'Cliente', value: 'customer' },
  { label: 'Administrador', value: 'admin' },
];

export default function RoleSelector() {
  const { role, loaded, setRole } = useRole();

  if (!loaded) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span>Rol:</span>
      <select
        value={role ?? 'customer'}
        onChange={(event) => setRole(event.target.value as UserRole)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
