import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Home } from './components/pages/home/home';
import { Navbar } from './components/navbar/navbar';
import { ReactiveFormsModule } from '@angular/forms';
import { LandingComponent } from './components/landing-page/landing-page';
import { PaqueteDetalleComponent } from './components/paquete-detalle-component/paquete-detalle-component';
import { ReservaForm } from './components/reserva-form/reserva-form';

@NgModule({
  declarations: [
    App,
    Login,
    Registro,
    Home,
    PaqueteDetalleComponent,
    ReservaForm,
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    LandingComponent,
    Navbar
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
