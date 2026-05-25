import { Component, inject, input, output, signal, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, PanelMenuModule, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  readonly mobileOpen = input(false);
  readonly requestClose = output<void>();
  readonly activeRoute = signal<string>('');

  readonly items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    { label: 'Competitors', icon: 'pi pi-building', routerLink: ['/competitors'] },
    { label: 'Signal Feed', icon: 'pi pi-bolt', routerLink: ['/signals'] },
    { label: 'Reports', icon: 'pi pi-file-word', routerLink: ['/reports'] },
    { label: 'Agent Logs', icon: 'pi pi-server', routerLink: ['/agents'] },
    { label: 'Users', icon: 'pi pi-users', routerLink: ['/users'], visible: this.authService.isAdmin() },
    { label: 'Agent Default Settings', icon: 'pi pi-cog', routerLink: ['/settings'], visible: this.authService.isAdmin() }
  ];

  get visibleItems(): MenuItem[] {
    return this.items.filter((item) => item.visible !== false);
  }

  constructor() {
    effect(() => {
      const route = this.router.url.split('/')[1] || 'dashboard';
      this.activeRoute.set(route);
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  isMenuItemActive(routePath: string): boolean {
    if (!routePath) return false;
    const route = routePath.split('/')[1] || 'dashboard';
    return this.activeRoute() === route;
  }

  onSidebarClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target || !window.matchMedia('(max-width: 1024px)').matches) {
      return;
    }

    const clickedMenuLink = target.closest('.menu-item');
    if (clickedMenuLink) {
      this.requestClose.emit();
    }
  }
}
