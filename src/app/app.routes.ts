import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full'
	},
	{
		path: 'dashboard',
		loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent)
	},
	{
		path: 'competitors',
		loadComponent: () =>
			import('./features/competitors/competitor-list/competitor-list').then(
				(m) => m.CompetitorListComponent
			)
	},
	{
		path: 'signals',
		loadComponent: () => import('./features/signals/signal-feed/signal-feed').then((m) => m.SignalFeedComponent)
	},
	{
		path: 'reports',
		loadComponent: () =>
			import('./features/reports/report-viewer/report-viewer').then((m) => m.ReportViewerComponent)
	},
	{
		path: 'agents',
		loadComponent: () => import('./features/agents/agent-logs/agent-logs').then((m) => m.AgentLogsComponent)
	}
];
