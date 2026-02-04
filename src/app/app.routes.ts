import { Routes } from '@angular/router';

import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { AppShellComponent } from './layout/app-shell.component';
import { NewAnalysisComponent } from './features/new-analysis/new-analysis.component';
import { HistoryComponent } from './features/history/history.component';
import { AnalysisDetailsComponent } from './features/analysis-details/analysis-details.component';
import { AboutComponent } from './features/about/about.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'analysis/new', component: NewAnalysisComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'history/:id', component: AnalysisDetailsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', pathMatch: 'full', redirectTo: 'analysis/new' }
    ]
  },
  { path: '**', redirectTo: '' }
];
