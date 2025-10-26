import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './components/login/login';
import { Resena } from './components/resena/resena';
import { Registro } from './components/registro/registro';
import { Home } from './components/pages/home/home';
import { Navbar } from './components/navbar/navbar';

@NgModule({
  declarations: [
    App,
    Login,
    Resena,
    Registro,
    Home,
    Navbar
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
