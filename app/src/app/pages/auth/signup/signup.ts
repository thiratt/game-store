import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    Button,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  currentStep = 1;
  totalSteps = 2;

  // Form data
  signupForm = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    displayName: '',
  };

  // Available avatars
  avatarOptions = [
    { id: 'avatar1', icon: 'pi pi-user', label: 'ผู้ใช้ทั่วไป' },
    { id: 'avatar2', icon: 'pi pi-crown', label: 'VIP' },
    { id: 'avatar3', icon: 'pi pi-star', label: 'Pro Gamer' },
    { id: 'avatar4', icon: 'pi pi-heart', label: 'นักเล่น' },
  ];

  selectedAvatar = '';

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectAvatar(avatarId: string) {
    this.selectedAvatar = avatarId;
    this.signupForm.avatar = avatarId;
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      return !!(
        this.signupForm.username &&
        this.signupForm.email &&
        this.signupForm.password &&
        this.signupForm.confirmPassword &&
        this.signupForm.password === this.signupForm.confirmPassword
      );
    }
    return true;
  }

  submitSignup() {
    if (this.validateCurrentStep()) {
      console.log('Submitting signup:', this.signupForm);
      // Implement actual signup logic here
    }
  }

  getSelectedAvatarIcon(): string {
    if (this.selectedAvatar) {
      const avatar = this.avatarOptions.find((a) => a.id === this.selectedAvatar);
      return avatar?.icon || 'pi pi-user';
    }
    return 'pi pi-user';
  }
}
