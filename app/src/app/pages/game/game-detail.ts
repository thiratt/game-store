import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GameService } from '../../services/game.service';
import { Game } from '../../interfaces/game.interface';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { Static } from "../../components/layout/static/static";
import { TagModule } from "primeng/tag";

@Component({
  selector: 'app-game-detail',
  imports: [CommonModule, Button, ToastModule, ThaiDatePipe, Static, TagModule],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.scss',
  providers: [MessageService],
})
export class GameDetail implements OnInit {
  gameId: string = '';
  game: Game | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameService: GameService,
    private messageService: MessageService
  ) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.params['id'];
    if (this.gameId) {
      this.loadGame();
    } else {
      this.router.navigate(['/']);
    }
  }

  loadGame(): void {
    this.isLoading = true;
    this.gameService.getGameById(this.gameId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.game = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading game:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลเกมได้',
        });
        this.router.navigate(['/']);
      },
    });
  }

  onNavigateBack(): void {
    this.router.navigate(['/']);
  }
}
