import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinner],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  auth = inject(AuthService);
  isOpen = false;

  user$ = this.auth.user$;

  toggle() { this.isOpen = !this.isOpen; }

  logout() {
    this.auth.logout();
    location.href = '/';
  }
}
