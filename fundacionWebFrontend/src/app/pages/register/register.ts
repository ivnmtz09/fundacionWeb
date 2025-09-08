import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password1: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }

  get passwordsDontMatch(): boolean {
    const { password1, password2 } = this.registerForm.value;
    return password1 && password2 && password1 !== password2;
  }

  onSubmit() {
    if (this.registerForm.valid && !this.passwordsDontMatch) {
      console.log('Register form data:', this.registerForm.value);
      // Aquí luego llamamos al AuthService
    }
  }
}
