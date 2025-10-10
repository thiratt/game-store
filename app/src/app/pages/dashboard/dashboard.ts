import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Chip } from 'primeng/chip';
import { GameService, Game } from '../../services/game.service';
import { ThaiDatePipe } from "../../pipe/thai-date.pipe";

interface GameCategoryOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    FormsModule,
    CardModule,
    ButtonModule,
    Select,
    InputText,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    RouterLink,
    ToastModule,
    Chip,
    ThaiDatePipe
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [MessageService],
})
export class Dashboard implements OnInit {
  selectedCategory: GameCategoryOption | undefined;
  gameCategories: GameCategoryOption[] = [];
  games: Game[] = [];
  isLoading: boolean = false;

  constructor(private gameService: GameService, private messageService: MessageService) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  ngOnInit() {
    this.loadCategories();
    this.loadGames();
  }

  loadCategories(): void {
    this.gameService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gameCategories = [
            { label: 'ทั้งหมด', value: 'all' },
            ...response.data.map((category) => ({
              label: category.name,
              value: category.id,
            })),
          ];
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดประเภทเกมได้',
        });
      },
    });
  }

  loadGames(): void {
    this.isLoading = true;
    this.gameService.getGames().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.games = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading games:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการเกมได้',
        });
      },
    });
  }
}
