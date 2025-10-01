import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, DecimalPipe, ButtonModule, TagModule, CardModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  featuredGame = {
    title: 'SILENT HILL F',
    description: 'ค้นพบความงดงามท่ามกลางความสยองขวัญในเกมสยองขวัญหลอนประสาทแนวญี่ปุ่นโฉมใหม่นี้',
    price: 1999,
    originalPrice: 2499,
    discount: 20,
    tags: ['สยองขวัญ', 'ผจญภัย', 'เล่นคนเดียว'],
    backgroundImage: '/1401549.jpg',
  };

  onBuyNow() {
    console.log('Buy now clicked');
    // Implement buy functionality
  }

  onAddToWishlist() {
    console.log('Add to wishlist clicked');
    // Implement wishlist functionality
  }
}
