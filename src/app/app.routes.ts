import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./core/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
		children: [
			{
				path: '',
				loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
			}
		]
	}
];
