import { UserRole } from './auth.model';

export interface User {
	id: string;
	username: string;
	email: string;
	role: UserRole;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateUserRequest {
	username: string;
	email: string;
	password: string;
	role: UserRole;
}

export interface UpdateUserRequest {
	username: string;
	email: string;
	password?: string;
	role: UserRole;
}