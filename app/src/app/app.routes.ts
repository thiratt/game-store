import { Routes } from '@angular/router';
import { Index } from './pages/index';
import { Login } from './pages/auth/login/login';
import { Auth } from './components/layout/auth/auth';

export const routes: Routes = [
  {
    path: '',
    component: Index,
  },
  {
    path: 'auth',
    component: Auth,
    children: [
      {
        path: 'login',
        component: Login,
      },
    ],
  },
];
