import { Component } from '@angular/core';

@Component({
  selector: 'app-programs',
  imports: [],
  templateUrl: './programs.html',
  styleUrl: './programs.scss'
})
export class ProgramsComponent {
  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
