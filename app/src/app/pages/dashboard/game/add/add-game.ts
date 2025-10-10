import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GameService, GameCategory } from '../../../../services/game.service';

interface GameForm {
  name: string;
  price: number;
  catergories: GameCategory[];
  description: string;
  coverImage: string;
}

@Component({
  selector: 'app-add-game',
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
  templateUrl: './add-game.html',
  styleUrl: './add-game.scss',
  providers: [MessageService],
})
export class AddGame implements OnInit {
  isDragOver: boolean = false;
  uploadProgress: number = 0;
  isSubmitting: boolean = false;

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
    private gameService: GameService,
    private messageService: MessageService
  ) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  ngOnInit(): void {
    this.loadCategories();
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
    this.game.coverImage = '';
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

    this.gameService.addGame(gameData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'เพิ่มเกมใหม่เรียบร้อยแล้ว',
          });
          setTimeout(() => {
            this.onNavigateBack();
          }, 1500);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding game:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถเพิ่มเกมได้',
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
