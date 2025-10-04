import { Component } from '@angular/core';
import { AdminNavigationBar } from "../../components/navbar/admin/admin-navigation-bar";

@Component({
  selector: 'app-dashboard',
  imports: [AdminNavigationBar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
