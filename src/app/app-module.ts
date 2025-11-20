import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Navbar } from './components/navbar/navbar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LandingComponent } from './components/landing-page/landing-page';
import { ListaDestinos } from './components/lista-destinos/lista-destinos';
import { ReservaForm } from './components/reserva-form/reserva-form';

// Shadcn UI Components
import { UbButtonDirective } from '@/components/ui/button';
import { UbCardDirective, UbCardContentDirective } from '@/components/ui/card';
import { UbInputDirective } from '@/components/ui/input';
import { UbBadgeDirective } from '@/components/ui/badge';
import { UbLabelDirective } from '@/components/ui/label';
import { UbSeparatorDirective } from '@/components/ui/separator';
import { UbSkeletonDirective } from '@/components/ui/skeleton';
import { UbSelectDirective } from '@/components/ui/select';
import { FormDestino } from './components/admin/form-destino/form-destino';
import { Perfil } from './components/perfil/perfil';
import { PanelAdmin } from './components/admin/panel-admin/panel-admin';
import { Reservas } from './components/admin/reservas/reservas';
import { Usuarios } from './components/admin/usuarios/usuarios';
import { ListaDestinos as ListaDestinosAdmin } from './components/admin/lista-destinos/lista-destinos';
import { DestinationDetail } from './components/destination-detail/destination-detail';
import { Checkout } from './components/checkout/checkout';
import { Footer } from './components/footer/footer';
import { AboutUs } from './components/about-us/about-us';
import { ModalResena } from './components/modal-resena/modal-resena';
import { ReservaSuccess } from './components/reserva-success/reserva-success';
import { Comments } from './components/comments/comments';

// Ngzard Carousel
import { ZardCarouselComponent } from '@shared/components/carousel/carousel.component';
import { ZardCarouselContentComponent } from '@shared/components/carousel/carousel-content.component';
import { ZardCarouselItemComponent } from '@shared/components/carousel/carousel-item.component';

@NgModule({
  declarations: [
    App,
    Login,
    Registro,
    ListaDestinos,
    ReservaForm,
    FormDestino,
    Perfil,
    PanelAdmin,
    Reservas,
    Usuarios,
    ListaDestinosAdmin,
    DestinationDetail,
    Checkout,
    Footer,
    AboutUs,
    ModalResena,
    ReservaSuccess,
    Comments,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    DatePipe,
    // Standalone Components
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
    // Ngzard Carousel - Standalone Components
    ZardCarouselComponent,
    ZardCarouselContentComponent,
    ZardCarouselItemComponent,
  ],
  providers: [],
  bootstrap: [App],
})
export class AppModule {}
