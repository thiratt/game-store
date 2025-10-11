import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GameService } from '../../../../services/game.service';
import { GameCategory } from '../../../../interfaces/game.interface';

interface GameForm {
  name: string;
  price: number;
  catergories: GameCategory[];
  description: string;
  coverImage: string;
}

@Component({
  selector: 'app-edit-game',
  imports: [
    CommonModule,
    Button,
    InputText,
    InputNumberModule,
    TextareaModule,
    FormsModule,
    MultiSelectModule,
    ToastModule,
  ],
  templateUrl: './edit-game.html',
  styleUrl: './edit-game.scss',
  providers: [MessageService],
})
export class EditGame implements OnInit {
  isDragOver: boolean = false;
  uploadProgress: number = 0;
  isSubmitting: boolean = false;
  isRedirecting: boolean = false;
  uploadedImageUrl: string = '';
  gameId: string = '';
  originalImageUrl: string = '';
  isLoading: boolean = false;

  catergories: GameCategory[] = [];

  game: GameForm = {
    name: '',
    price: 0,
    catergories: [],
    description: '',
    coverImage: '',
  };

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
      this.loadCategories();
      this.loadGame();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadGame(): void {
    this.isLoading = true;
    this.gameService.getGameById(this.gameId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          const gameData = response.data;
          this.game = {
            name: gameData.title,
            price: gameData.price,
            catergories: gameData.categories,
            description: gameData.description,
            coverImage: gameData.imageUrl || '',
          };
          this.originalImageUrl = gameData.imageUrl || '';
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
        this.router.navigate(['/dashboard']);
      },
    });
  }

  loadCategories(): void {
    this.gameService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.catergories = response.data;
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

  onNavigateBack(): void {
    if (this.uploadedImageUrl) {
      this.gameService.deleteImage(this.uploadedImageUrl).subscribe({
        next: (response) => {
          console.log('Uploaded image cleaned up successfully');
        },
        error: (error) => {
          console.error('Failed to delete uploaded image:', error);
        },
      });
    }
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.handleFileUpload(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();

    if (this.uploadedImageUrl) {
      this.gameService.deleteImage(this.uploadedImageUrl).subscribe({
        next: (response) => {
          console.log('Image deleted from server successfully');
        },
        error: (error) => {
          console.error('Failed to delete image from server:', error);
        },
      });
    }

    this.game.coverImage = '';
    this.uploadedImageUrl = '';
    this.uploadProgress = 0;
  }

  private handleFileUpload(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'ไฟล์ไม่ถูกต้อง',
        detail: 'กรุณาเลือกไฟล์รูปภาพ (JPG, JPEG, PNG, GIF, WebP)',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.messageService.add({
        severity: 'error',
        summary: 'ไฟล์ใหญ่เกินไป',
        detail: 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB',
      });
      return;
    }

    const oldImageUrl = this.uploadedImageUrl;
    if (oldImageUrl) {
      this.gameService.deleteImage(oldImageUrl).subscribe({
        next: (response) => {
          console.log('Old image deleted successfully before uploading new one');
        },
        error: (error) => {
          console.error('Failed to delete old image:', error);
        },
      });
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.game.coverImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.uploadProgress = 0;
    this.gameService.uploadImage(file).subscribe({
      next: (response) => {
        this.uploadProgress = 100;
        if (response.success && response.data) {
          this.uploadedImageUrl = response.data;
          this.game.coverImage = response.data;
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'อัปโหลดรูปภาพเรียบร้อยแล้ว',
          });
        }
      },
      error: (error) => {
        this.uploadProgress = 0;
        this.game.coverImage = '';
        this.uploadedImageUrl = '';
        console.error('Upload error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถอัปโหลดรูปภาพได้',
        });
      },
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const gameData = {
      title: this.game.name,
      description: this.game.description,
      price: this.game.price,
      releaseDate: new Date(),
      categoryIds: this.game.catergories.map((c) => c.id),
      imageUrl: this.game.coverImage,
    };

    this.gameService.updateGame(this.gameId, gameData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.uploadedImageUrl = '';

          if (this.originalImageUrl && this.originalImageUrl !== this.game.coverImage) {
            this.gameService.deleteImage(this.originalImageUrl).subscribe({
              next: () => console.log('Old image deleted successfully'),
              error: (error) => console.error('Failed to delete old image:', error),
            });
          }

          this.isRedirecting = true;
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'แก้ไขเกมเรียบร้อยแล้ว',
          });
          setTimeout(() => {
            this.router.navigate(['/dashboard'], { replaceUrl: true });
          }, 1500);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating game:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถแก้ไขเกมได้',
        });
      },
    });
  }

  private validateForm(): boolean {
    let isValid = true;

    if (!this.game.name.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อมูลไม่ครบถ้วน',
        detail: 'กรุณากรอกชื่อเกม',
      });
      isValid = false;
    }

    if (this.game.price <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อมูลไม่ถูกต้อง',
        detail: 'กรุณากรอกราคาที่ถูกต้อง',
      });
      isValid = false;
    }

    if (!this.game.description.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อมูลไม่ครบถ้วน',
        detail: 'กรุณากรอกรายละเอียดเกม',
      });
      isValid = false;
    }

    if (this.game.catergories.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อมูลไม่ครบถ้วน',
        detail: 'กรุณาเลือกประเภทของเกมอย่างน้อย 1 ประเภท',
      });
      isValid = false;
    }

    if (!this.game.coverImage) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อมูลไม่ครบถ้วน',
        detail: 'กรุณาอัปโหลดรูปภาพปกเกม',
      });
      isValid = false;
    }

    return isValid;
  }
}
