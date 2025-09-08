import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './me.html',
  styleUrl: './me.scss'
})
export class MeComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  async ngOnInit() {
    const token = localStorage.getItem('access');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('No autorizado');

      this.user = await response.json();
    } catch {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.router.navigate(['/login']);
  }
}
