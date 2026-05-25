import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly http = inject(HttpClient);
	private readonly basePath = `${environment.apiUrl}/users`;

	getAll(): Observable<User[]> {
		return this.http.get<User[]>(this.basePath);
	}

	getById(id: string): Observable<User> {
		return this.http.get<User>(`${this.basePath}/${id}`);
	}

	create(request: CreateUserRequest): Observable<User> {
		return this.http.post<User>(this.basePath, request);
	}

	update(id: string, request: UpdateUserRequest): Observable<User> {
		return this.http.put<User>(`${this.basePath}/${id}`, request);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.basePath}/${id}`);
	}
}