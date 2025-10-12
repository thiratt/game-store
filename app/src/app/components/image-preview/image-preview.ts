import { Component, HostListener, Input, signal } from '@angular/core';

import { Button } from 'primeng/button';

@Component({
  selector: 'app-image-preview',
  imports: [Button],
  templateUrl: './image-preview.html',
  styleUrl: './image-preview.scss',
})
export class ImagePreview {
  @Input({ required: true }) src: string = '';
  @Input() alt: string = 'Image Preview';
  @Input() class: string = '';

  isModalVisible = signal(false);

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (!this.isModalVisible()) return;

    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  openModal() {
    this.setDisableBodyScrolling(true);
    this.isModalVisible.set(true);
  }

  closeModal() {
    this.setDisableBodyScrolling(false);
    this.isModalVisible.set(false);
  }

  private setDisableBodyScrolling(disable: boolean) {
    const body = document.body;
    if (body) {
      body.style.overflow = disable ? 'hidden' : '';
    }
  }
}
