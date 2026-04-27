import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { TopbarComponent } from './layout/topbar/topbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-topbar [isDrawerOpen]="mobileSidebarOpen" (menuToggle)="toggleMobileSidebar()" />
      <div class="layout-main">
        <app-sidebar [mobileOpen]="mobileSidebarOpen" (requestClose)="closeMobileSidebar()" />
        @if (mobileSidebarOpen) {
          <button
            type="button"
            class="layout-backdrop"
            aria-label="Close navigation menu"
            (click)="closeMobileSidebar()"
          ></button>
        }
        <div class="layout-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class AppComponent {
  mobileSidebarOpen = false;

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }
}
