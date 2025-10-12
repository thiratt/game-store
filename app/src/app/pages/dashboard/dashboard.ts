import { Component, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Chip } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

import { Game } from '../../interfaces/game.interface';
import { GameService } from '../../services/game.service';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';

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
    ConfirmDialogModule,
    Chip,
    ThaiDatePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [MessageService, ConfirmationService],
})
export class Dashboard implements OnInit {
  selectedCategory: GameCategoryOption | undefined;
  gameCategories: GameCategoryOption[] = [];
  games: Game[] = [];
  isLoading: boolean = false;

  constructor(
    private gameService: GameService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

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

  confirmDelete(game: Game): void {
    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะลบเกม "${game.title}"?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteGame(game);
      },
    });
  }

  private deleteGame(game: Game): void {
    if (!game.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'เกิดข้อผิดพลาด',
        detail: 'ไม่พบ ID ของเกม',
      });
      return;
    }

    this.gameService.deleteGame(game.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.games = this.games.filter((g) => g.id !== game.id);

          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'ลบเกมเรียบร้อยแล้ว',
          });
        }
      },
      error: (error) => {
        console.error('Error deleting game:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบเกมได้',
        });
      },
    });
  }
}
