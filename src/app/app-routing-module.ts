import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { LandingComponent } from './components/landing-page/landing-page';
import { Registro } from './components/registro/registro';
import { ListaDestinos } from './components/lista-destinos/lista-destinos';
import { PaqueteDetalleComponent } from './components/paquete-detalle-component/paquete-detalle-component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'destinos', component: ListaDestinos },
  { path: 'paquete/:id', component: PaqueteDetalleComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // ruta por defecto si no se especifica ninguna
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
