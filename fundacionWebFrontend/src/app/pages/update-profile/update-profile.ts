import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-profile.html',
  styleUrls: ['./update-profile.scss']
})
export class UpdateProfile {
  profileForm!: FormGroup;
  user: User | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe((user) => {
      this.user = user;
      this.profileForm = this.fb.group({
        first_name: [user.first_name || '', Validators.required],
        last_name: [user.last_name || '', Validators.required],
        bio: [user.bio || ''],
        interests: [user.interests || ''],
        phone_number: [user.phone_number || ''],
        address: [user.address || '']
      });
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: (res) => {
          alert('Perfil actualizado con éxito');
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar perfil');
        }
      });
    }
  }
}
