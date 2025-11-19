import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { LandingComponent } from './components/landing-page/landing-page';
import { Registro } from './components/registro/registro';
import { ListaDestinos } from './components/lista-destinos/lista-destinos';
import { PaqueteDetalleComponent } from './components/paquete-detalle-component/paquete-detalle-component';
import { FormDestino } from './components/admin/form-destino/form-destino';
import { Perfil } from './components/perfil/perfil';
import { PanelAdmin } from './components/admin/panel-admin/panel-admin';
import { Reservas } from './components/admin/reservas/reservas';
import { Usuarios } from './components/admin/usuarios/usuarios';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'destinos', component: ListaDestinos },
  { path: 'paquete/:id', component: PaqueteDetalleComponent },
  { path: 'perfil', component: Perfil },
  { path: 'admin/panel', component: PanelAdmin },
  { path: 'admin/destinos', component: FormDestino },
  { path: 'admin/reservas', component: Reservas },
  { path: 'admin/usuarios', component: Usuarios },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // ruta por defecto si no se especifica ninguna
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
