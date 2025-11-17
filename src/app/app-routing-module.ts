import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { LandingComponent } from './components/landing-page/landing-page';
import { Registro } from './components/registro/registro';
<<<<<<< HEAD
import { PaqueteDetalleComponent } from './components/paquete-detalle-component/paquete-detalle-component';
=======
import { ListaDestinos } from './components/lista-destinos/lista-destinos';
>>>>>>> 053e9b49fe2ed289363e7a0112da62c20c5a9fca

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
<<<<<<< HEAD
  { path: 'home', component: Home },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // ruta por defecto si no se especifica ninguna
  { path: 'paquete/:id', component : PaqueteDetalleComponent}
=======
  { path: 'destinos', component: ListaDestinos },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // ruta por defecto si no se especifica ninguna
>>>>>>> 053e9b49fe2ed289363e7a0112da62c20c5a9fca
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
