import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './me.html',
  styleUrls: ['./me.scss']
})
export class MeComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: User) => {
        this.user = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
