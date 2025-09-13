import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrap" role="status" aria-live="polite">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-wrap { display:flex; align-items:center; justify-content:center; padding:1rem; }
    .spinner {
      width:36px; height:36px; border-radius:50%;
      border:4px solid rgba(0,0,0,0.08);
      border-top-color: rgba(0,0,0,0.35);
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingSpinner {}
