import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //aca van todas las paginas de la app
  {path: '', redirectTo: '/home', pathMatch: 'full'},// ruta por defecto si no se especifica ninguna

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
