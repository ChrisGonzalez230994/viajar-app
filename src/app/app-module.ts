import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Home } from './components/pages/home/home';
import { Navbar } from './components/navbar/navbar';
import { ReactiveFormsModule } from '@angular/forms';
import { LandingPage } from './components/landing-page/landing-page';

@NgModule({
  declarations: [
    App,
    Login,
    Registro,
    Home,
    Navbar,
    LandingPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
