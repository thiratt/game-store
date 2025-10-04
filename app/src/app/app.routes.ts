import { Routes } from '@angular/router';
import { Index } from './pages/index';
import { Login } from './pages/auth/login/login';
import { Auth } from './components/layout/auth/auth';
import { Signup } from './pages/auth/signup/signup';
import { AuthGuard } from './services/auth.guard';
import { UserProfile } from './pages/profile/profile';
import { Dashboard } from './pages/dashboard/dashboard';
import { Edit } from './pages/profile/edit/edit';
import { AdminProfile } from './pages/dashboard/profile/admin-profile';
import { AdminEditProfile } from './pages/dashboard/profile/edit/admin-edit-profile';

export const routes: Routes = [
  {
    path: '',
    component: Index,
  },
  {
    path: 'profile',
    component: UserProfile,
    title: 'โปรไฟล์',
  },
  {
    path: 'profile/edit',
    component: Edit,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'แดชบอร์ด',
  },
  {
    path: 'dashboard/profile',
    component: AdminProfile,
  },
  {
    path: 'dashboard/profile/edit',
    component: AdminEditProfile,
  },
  {
    path: 'auth',
    component: Auth,
    canActivate: [AuthGuard],
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
];
