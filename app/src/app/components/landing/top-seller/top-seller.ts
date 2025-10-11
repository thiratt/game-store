import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { ThaiYear } from '../../../directive/thai-year.directive';
import { CardModule } from 'primeng/card';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-top-seller',
  imports: [ButtonModule, DatePicker, ThaiYear, FormsModule, CardModule, DecimalPipe, ThaiDatePipe],
  templateUrl: './top-seller.html',
  styleUrl: './top-seller.scss',
})
export class TopSeller implements OnInit {
  selectedDate: Date | null = null;
  games = [
    {
      id: '2a21bc94-b2bf-413f-a418-290d7a0787b5',
      title: 'The Last of Us Part I',
      description:
        'สัมผัสประสบการณ์เกมที่ได้รับรางวัลมากมายที่เป็นต้นกำเนิดของรายการโทรทัศน์ที่ได้รับคำชมอย่างล้นหลาม พาโจเอลและเอลลี่เดินทางข้ามสหรัฐอเมริกาหลังโลกาวินาศ และพบกับเหล่าพันธมิตรและศัตรูที่คุณจะไม่มีวันลืมใน The Last of Us™',
      categories: [
        {
          id: 1,
          name: 'กระโดดข้ามด่าน',
        },
        {
          id: 2,
          name: 'กีฬา',
        },
        {
          id: 3,
          name: 'จังหวะดนตรี',
        },
        {
          id: 4,
          name: 'จำลองสถานการณ์',
        },
        {
          id: 5,
          name: 'ต่อสู้',
        },
      ],
      releaseDate: '2025-10-10T11:22:34.894',
      price: 1999,
      imageUrl: '/image/0f1caa57-4fb3-473f-9613-ec87cdc1b6d3.jpg',
    },
  ];

  constructor(private gameService: GameService) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  ngOnInit() {
    this.selectedDate = new Date();
  }

  onDateChange(date: Date | null) {
    this.selectedDate = date;
    if (date) {
      console.log('Selected date in Buddhist Era:', ThaiYear.formatDateToBuddhistEra(date));
    }
  }

  goToPreviousDay() {
    // if (this.selectedDate) {
    //   const newDate = new Date(this.selectedDate);
    //   newDate.setDate(newDate.getDate() - 1);
    //   this.selectedDate = newDate;
    // }
  }

  goToNextDay() {
    // if (this.selectedDate) {
    //   const newDate = new Date(this.selectedDate);
    //   newDate.setDate(newDate.getDate() + 1);
    //   this.selectedDate = newDate;
    // }
  }
}
