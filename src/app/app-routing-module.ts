import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { LandingComponent } from './components/landing-page/landing-page';
import { Registro } from './components/registro/registro';
import { ListaDestinos } from './components/lista-destinos/lista-destinos';
import { FormDestino } from './components/admin/form-destino/form-destino';
import { Perfil } from './components/perfil/perfil';
import { PanelAdmin } from './components/admin/panel-admin/panel-admin';
import { Reservas } from './components/admin/reservas/reservas';
import { Usuarios } from './components/admin/usuarios/usuarios';
import { ListaDestinos as ListaDestinosAdmin } from './components/admin/lista-destinos/lista-destinos';
import { DestinationDetail } from './components/destination-detail/destination-detail';
import { Checkout } from './components/checkout/checkout';
import { ReservaSuccess } from './components/reserva-success/reserva-success';
import { AboutUs } from './components/about-us/about-us';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'destinos', component: ListaDestinos },
  { path: 'checkout/:id', component: Checkout },
  { path: 'reserva-success', component: ReservaSuccess },
  { path: 'perfil', component: Perfil },
  { path: 'admin/panel', component: PanelAdmin },
  { path: 'admin/lista-destinos', component: ListaDestinosAdmin },
  { path: 'admin/destinos', component: FormDestino },
  { path: 'admin/destinos/:id', component: FormDestino },
  { path: 'admin/reservas', component: Reservas },
  { path: 'admin/usuarios', component: Usuarios },
  { path: 'detalle-destino/:id', component: DestinationDetail },
  { path: 'nosotros', component: AboutUs },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // ruta por defecto si no se especifica ninguna
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
