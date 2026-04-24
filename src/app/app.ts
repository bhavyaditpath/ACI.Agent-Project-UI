import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { TopbarComponent } from './layout/topbar/topbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-topbar />
      <div class="layout-main">
        <app-sidebar />
        <div class="layout-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class AppComponent {}
