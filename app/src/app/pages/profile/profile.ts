import { Component, OnInit } from '@angular/core';
import { Card } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../services/auth.service';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-profile',
  imports: [
    Navbar,
    Card,
    ButtonModule,
    ToggleButtonModule,
    InputText,
    IconField,
    InputIcon,
    TableModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  transactionHistory = [
    {
      date: '2024-10-01',
      type: 'เติมเงิน',
      description: 'เติมเงินเข้ากระเป๋า',
      amount: '+500 บาท',
    },
  ];
  constructor(private authService: AuthService) {}
  ngOnInit(): void {

  }

  get currentUser() {
    return this.authService.currentUser;
  }
}
