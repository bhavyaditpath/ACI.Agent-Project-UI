import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  readonly mobileOpen = input(false);
  readonly requestClose = output<void>();

  readonly items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    { label: 'Competitors', icon: 'pi pi-building', routerLink: ['/competitors'] },
    { label: 'Signal Feed', icon: 'pi pi-bolt', routerLink: ['/signals'] },
    { label: 'Reports', icon: 'pi pi-file-word', routerLink: ['/reports'] },
    { label: 'Agent Logs', icon: 'pi pi-server', routerLink: ['/agents'] }
  ];

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
