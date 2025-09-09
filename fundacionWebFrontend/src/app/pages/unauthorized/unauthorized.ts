import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.scss']
})
export class UnauthorizedComponent {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/me']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}