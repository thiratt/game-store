import { Routes } from '@angular/router';
import { Index } from './pages/index';
import { Login } from './pages/auth/login/login';
import { Auth } from './components/layout/auth/auth';
import { Signup } from './pages/auth/signup/signup';
import { AuthGuard } from './services/auth.guard';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: Index,
  },
  {
    path: 'profile',
    component: Profile,
    title: 'โปรไฟล์',
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
