import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserRole } from '../../../core/models/auth.model';
import { CreateUserRequest, UpdateUserRequest, User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

type RoleOption = { label: string; value: UserRole | 'all' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
	selector: 'app-users-page',
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ButtonModule,
		CardModule,
		DialogModule,
		InputTextModule,
		PasswordModule,
		SelectModule,
		TableModule,
		TagModule,
		ToastModule
	],
	providers: [MessageService],
	templateUrl: './users-page.html',
	styleUrl: './users-page.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent implements OnInit {
	private readonly userService = inject(UserService);
	private readonly messageService = inject(MessageService);
	private readonly formBuilder = inject(FormBuilder);
	private readonly cdr = inject(ChangeDetectorRef);

	readonly roleOptions: RoleOption[] = [
		{ label: 'All Roles', value: 'all' },
		{ label: 'Admin', value: UserRole.Admin },
		{ label: 'User', value: UserRole.User }
	];

	readonly users = signal<User[]>([]);
	isLoading = true;
	isSaving = false;
	isDeleting = false;
	dialogVisible = false;
	deleteDialogVisible = false;
	selectedRole: UserRole | 'all' = 'all';
	searchText = '';
	editingUser: User | null = null;
	userToDelete: User | null = null;

	readonly userFormGroup = this.formBuilder.group({
		username: ['', [Validators.required, Validators.minLength(3)]],
		email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
		password: ['', [Validators.required, Validators.minLength(5)]],
		role: [UserRole.User, [Validators.required]]
	});

	get filteredUsers(): User[] {
		const search = this.searchText.trim().toLowerCase();
		const role = this.selectedRole;

		return this.users().filter((user) => {
			const matchesRole = role === 'all' || user.role === role;
			const matchesSearch = !search || [user.username, user.email, user.role].some((value) =>
				value.toLowerCase().includes(search)
			);
			return matchesRole && matchesSearch;
		});
	}

	clearFilters(): void {
		this.searchText = '';
		this.selectedRole = 'all';
	}

	ngOnInit(): void {
		this.loadUsers();
	}

	loadUsers(): void {
		this.isLoading = true;
		this.userService.getAll().pipe(finalize(() => {
			this.isLoading = false;
			this.cdr.detectChanges();
		})).subscribe({
			next: (data) => {
				this.users.set(data);
				this.cdr.detectChanges();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load users.',
					life: 4000
				});
			}
		});
	}

	openCreateDialog(): void {
		this.editingUser = null;
		this.userFormGroup.controls.password.setValidators([Validators.required, Validators.minLength(5)]);
		this.userFormGroup.controls.password.updateValueAndValidity({ emitEvent: false });
		this.userFormGroup.reset({ username: '', email: '', password: '', role: UserRole.User });
		this.dialogVisible = true;
	}

	openEditDialog(user: User): void {
		this.editingUser = user;
		this.userFormGroup.controls.password.setValidators([Validators.minLength(5)]);
		this.userFormGroup.controls.password.updateValueAndValidity({ emitEvent: false });
		this.userFormGroup.reset({
			username: user.username,
			email: user.email,
			password: '',
			role: user.role
		});
		this.dialogVisible = true;
	}

	closeDialog(): void {
		this.dialogVisible = false;
		this.editingUser = null;
		this.userFormGroup.reset({ username: '', email: '', password: '', role: UserRole.User });
	}

	saveUser(): void {
		if (this.isSaving) {
			return;
		}

		if (this.userFormGroup.invalid) {
			this.userFormGroup.markAllAsTouched();
			return;
		}

		const raw = this.userFormGroup.getRawValue();
		const role = raw.role as UserRole;
		const editingUser = this.editingUser;

		const request = editingUser
			? {
				username: raw.username ?? '',
				email: raw.email ?? '',
				password: raw.password || undefined,
				role
			}
			: {
				username: raw.username ?? '',
				email: raw.email ?? '',
				password: raw.password ?? '',
				role
			};

		this.isSaving = true;
		const request$ = editingUser
			? this.userService.update(editingUser.id, request as UpdateUserRequest)
			: this.userService.create(request as CreateUserRequest);

		request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: editingUser ? 'User Updated' : 'User Created',
					detail: editingUser ? 'The user was updated successfully.' : 'The user was created successfully.',
					life: 3000
				});
				this.closeDialog();
				this.loadUsers();
			},
			error: (error: HttpErrorResponse) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: this.getApiErrorMessage(
						error,
						editingUser ? 'Failed to update user.' : 'Failed to create user.'
					),
					life: 4000
				});
			}
		});
	}

	private getApiErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
		const response = error.error;

		if (typeof response === 'string' && response.trim()) {
			return response;
		}

		if (response && typeof response === 'object') {
			const apiMessage = response.error ?? response.message ?? response.title;
			if (typeof apiMessage === 'string' && apiMessage.trim()) {
				return apiMessage;
			}

			if (Array.isArray(response.errors)) {
				for (const entry of response.errors as unknown[]) {
					if (typeof entry === 'string' && entry.trim()) {
						return entry;
					}

					if (Array.isArray(entry)) {
						for (const nestedEntry of entry as unknown[]) {
							if (typeof nestedEntry === 'string' && nestedEntry.trim()) {
								return nestedEntry;
							}
						}
					}
				}
			}
		}

		return fallbackMessage;
	}

	confirmDelete(user: User): void {
		this.userToDelete = user;
		this.deleteDialogVisible = true;
	}

	closeDeleteDialog(): void {
		this.deleteDialogVisible = false;
		this.userToDelete = null;
	}

	deleteUser(): void {
		const user = this.userToDelete;
		if (!user || this.isDeleting) {
			return;
		}

		this.isDeleting = true;
		this.userService.delete(user.id).pipe(finalize(() => (this.isDeleting = false))).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'User Deleted',
					detail: `${user.username} was deleted successfully.`,
					life: 3000
				});
				this.closeDeleteDialog();
				this.loadUsers();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to delete user.',
					life: 4000
				});
			}
		});
	}

	getRoleSeverity(role: UserRole): 'success' | 'info' | 'secondary' {
		return role === UserRole.Admin ? 'success' : 'info';
	}

	getStatusSeverity(isActive?: boolean): 'success' | 'danger' {
		return isActive === false ? 'danger' : 'success';
	}
}