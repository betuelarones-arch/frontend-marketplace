export interface Product {
    id: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    imageUrl?: string;
    categoryId?: number;
    category?: Category;
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    id: number;
    nombre: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    id: number;
    email: string;
    role: 'customer' | 'admin';
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}