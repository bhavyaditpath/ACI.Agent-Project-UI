import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { TopbarComponent } from './layout/topbar/topbar';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule, SidebarComponent, TopbarComponent],
  providers: [MessageService],
  template: `
    <p-toast />

    <ng-container *ngIf="isLoggedIn; else publicLayout">
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
    </ng-container>

    <ng-template #publicLayout>
      <router-outlet />
    </ng-template>
  `,
  styleUrl: './app.css'
})
export class AppComponent {
  mobileSidebarOpen = false;

  constructor(private authService: Auth) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }
}

