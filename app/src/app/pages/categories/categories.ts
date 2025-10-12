import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

import { Game, GameCategoryOption } from '../../interfaces/game.interface';
import { GameService } from '../../services/game.service';
import { Static } from '../../components/layout/static/static';
import { UserGameCard } from '../../components/user/game-card/game-card';

@Component({
  selector: 'app-categories',
  imports: [
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
    ConfirmDialogModule,
    Static,
    UserGameCard,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  providers: [MessageService, ConfirmationService],
})
export class Categories implements OnInit {
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
            { id: 0, name: 'ทั้งหมด', value: 'all' },
            ...response.data.map((category) => ({
              id: category.id,
              name: category.name,
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
