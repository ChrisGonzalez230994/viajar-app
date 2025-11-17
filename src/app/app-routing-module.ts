import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/pages/home/home';
import { LandingComponent } from './components/landing-page/landing-page';
import { Registro } from './components/registro/registro';
import { PaqueteDetalleComponent } from './components/paquete-detalle-component/paquete-detalle-component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'home', component: Home },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // ruta por defecto si no se especifica ninguna
  { path: 'paquete/:id', component : PaqueteDetalleComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
