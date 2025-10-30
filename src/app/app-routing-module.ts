import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/pages/home/home';
import { LandingComponent } from './components/landing-page/landing-page';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '', pathMatch: 'full' } // ruta por defecto si no se especifica ninguna
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
