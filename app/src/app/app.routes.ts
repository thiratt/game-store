import { Routes } from '@angular/router';
import { Index } from './pages/index';
import { Login } from './pages/auth/login/login';
import { Auth } from './components/layout/auth/auth';
import { Signup } from './pages/auth/signup/signup';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';
import { GuestGuard } from './services/guest.guard';
import { HomeGuard } from './services/home.guard';
import { UserProfile } from './pages/profile/profile';
import { Dashboard } from './pages/dashboard/dashboard';
import { Edit } from './pages/profile/edit/edit';
import { AdminProfile } from './pages/dashboard/profile/admin-profile';
import { AdminEditProfile } from './pages/dashboard/profile/edit/admin-edit-profile';
import { NotFound } from './pages/not-found/not-found';
import { DashboardLayout } from './components/layout/dashboard/dashboard-layout';
import { AddGame } from './pages/dashboard/game/add/add-game';
import { EditGame } from './pages/dashboard/game/edit/edit-game';

export const routes: Routes = [
  {
    path: '',
    component: Index,
    canActivate: [HomeGuard],
  },
  {
    path: 'profile',
    component: UserProfile,
    title: 'โปรไฟล์',
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/edit',
    component: Edit,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    title: 'แดชบอร์ด',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'game/add',
        component: AddGame,
        title: 'เพิ่มเกม',
      },
      {
        path: 'game/edit/:id',
        component: EditGame,
        title: 'แก้ไขเกม',
      },
      {
        path: 'profile',
        component: AdminProfile,
      },
      {
        path: 'profile/edit',
        component: AdminEditProfile,
      },
    ],
  },
  {
    path: 'auth',
    component: Auth,
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        component: Login,
        title: 'เข้าสู่ระบบ',
      },
      {
        path: 'signup',
        component: Signup,
        title: 'สมัครสมาชิก',
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
