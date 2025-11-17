import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Navbar } from './components/navbar/navbar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LandingComponent } from './components/landing-page/landing-page';
import { ListaDestinos } from './components/lista-destinos/lista-destinos';

// Shadcn UI Components
import { UbButtonDirective } from '@/components/ui/button';
import { UbCardDirective, UbCardContentDirective } from '@/components/ui/card';
import { UbInputDirective } from '@/components/ui/input';
import { UbBadgeDirective } from '@/components/ui/badge';
import { UbLabelDirective } from '@/components/ui/label';
import { UbSeparatorDirective } from '@/components/ui/separator';
import { UbSkeletonDirective } from '@/components/ui/skeleton';
import { UbSelectDirective } from '@/components/ui/select';

@NgModule({
  declarations: [App, Login, Registro, ListaDestinos],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LandingComponent,
    Navbar,
    // Shadcn UI Directives
    UbButtonDirective,
    UbCardDirective,
    UbCardContentDirective,
    UbInputDirective,
    UbBadgeDirective,
    UbLabelDirective,
    UbSeparatorDirective,
    UbSkeletonDirective,
    UbSelectDirective,
  ],
  providers: [],
  bootstrap: [App],
})
export class AppModule {}
