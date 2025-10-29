import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/pages/home/home';

const routes: Routes = [
  { path: 'login', component: Login },
  {path: '**', redirectTo: '/', pathMatch: 'full'} // ruta por defecto si no se especifica ninguna
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
