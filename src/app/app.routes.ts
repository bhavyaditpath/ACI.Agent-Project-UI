import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login/login').then((m) => m.Login)
	},
	{
		path: 'dashboard',
		canActivate: [authGuard],
		loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent)
	},
	{
		path: 'competitors',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./features/competitors/competitor-list/competitor-list').then(
				(m) => m.CompetitorListComponent
			)
	},
	{
		path: 'signals',
		canActivate: [authGuard],
		loadComponent: () => import('./features/signals/signal-feed/signal-feed').then((m) => m.SignalFeedComponent)
	},
	{
		path: 'reports',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./features/reports/report-viewer/report-viewer').then((m) => m.ReportViewerComponent)
	},
	{
		path: 'agents',
		canActivate: [authGuard],
		loadComponent: () => import('./features/agents/agent-logs/agent-logs').then((m) => m.AgentLogsComponent)
	},
	{
		path: 'settings',
		canActivate: [authGuard, adminGuard],
		loadComponent: () => import('./features/settings/settings-page/settings-page.component').then((m) => m.SettingsPageComponent)
	},
	{
		path: 'users',
		canActivate: [authGuard, adminGuard],
		loadComponent: () => import('./features/users/users-page/users-page').then((m) => m.UsersPageComponent)
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
