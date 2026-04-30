import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Auth } from '../../../core/services/auth';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: Auth,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}

