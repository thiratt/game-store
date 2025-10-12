import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

import { Static } from '../../components/layout/static/static';
import { UserGameCard } from '../../components/user/game-card/game-card';
import { Game, GameCategoryOption } from '../../interfaces/game.interface';
import { GameService, ApiResponse } from '../../services/game.service';

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
  searchQuery: string = '';
  isSearchMode: boolean = false;

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
    const categoryId = this.selectedCategory?.id || 0;

    const gameRequest =
      categoryId === 0 ? this.gameService.getGames() : this.gameService.searchGames('', categoryId);

    gameRequest.subscribe({
      next: (response: ApiResponse<Game[]>) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.games = response.data;
        }
      },
      error: (error: any) => {
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

  onCategoryChange(): void {
    if (!this.isSearchMode) {
      this.loadGames();
    }
  }

  searchGames(): void {
    if (!this.searchQuery.trim()) {
      this.isSearchMode = false;
      this.loadGames();
      return;
    }

    this.isLoading = true;
    this.isSearchMode = true;
    const categoryId = this.selectedCategory?.id || 0;

    this.gameService.searchGames(this.searchQuery.trim(), categoryId).subscribe({
      next: (response: ApiResponse<Game[]>) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.games = response.data;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error searching games:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถค้นหาเกมได้',
        });
      },
    });
  }

  onSearchInputChange(): void {
    if (!this.searchQuery.trim()) {
      this.isSearchMode = false;
      this.loadGames();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearchMode = false;
    this.loadGames();
  }
}
