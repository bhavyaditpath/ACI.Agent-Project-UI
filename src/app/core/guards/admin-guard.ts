import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
	const authService = inject(Auth);
	const router = inject(Router);

	if (authService.isAdmin()) {
		return true;
	}

	router.navigate(['/dashboard']);
	return false;
};