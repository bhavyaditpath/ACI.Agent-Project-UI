import { Component, inject, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, PanelMenuModule, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private readonly authService = inject(Auth);

  readonly mobileOpen = input(false);
  readonly requestClose = output<void>();

  readonly items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    { label: 'Competitors', icon: 'pi pi-building', routerLink: ['/competitors'] },
    { label: 'Signal Feed', icon: 'pi pi-bolt', routerLink: ['/signals'] },
    { label: 'Reports', icon: 'pi pi-file-word', routerLink: ['/reports'] },
    { label: 'Agent Logs', icon: 'pi pi-server', routerLink: ['/agents'] }
  ];

  onLogout(): void {
    this.authService.logout();
  }

  onSidebarClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target || !window.matchMedia('(max-width: 1024px)').matches) {
      return;
    }

    const clickedMenuLink = target.closest('.p-panelmenu-item-link, .p-panelmenu-header-link');
    if (clickedMenuLink) {
      this.requestClose.emit();
    }
  }
}
