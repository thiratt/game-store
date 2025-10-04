import { Component, OnInit } from '@angular/core';
import { AdminNavigationBar } from '../../components/navbar/admin/admin-navigation-bar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DecimalPipe } from '@angular/common';

interface GameCategory {
  label: string;
  value: string;
}

interface Game {
  title: string;
  category: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    FormsModule,
    AdminNavigationBar,
    CardModule,
    ButtonModule,
    Select,
    InputText,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  selectedCategory: GameCategory | undefined;
  gameCategories: GameCategory[] = [];
  games: Game[] = [
    {
      title: 'SILENT HILL f',
      category: 'horror',
      price: 1999,
      imageUrl: '/1401549.jpg',
    },
  ];

  ngOnInit() {
    this.gameCategories = [
      { label: 'ทั้งหมด', value: 'all' },
      { label: 'สยองขวัญ', value: 'horror' },
      { label: 'ผจญภัย', value: 'adventure' },
    ];
  }
}
