import { Paqueteservice } from '@/app/service/paquete.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paquete-detalle-component',
  standalone: false,
  templateUrl: './paquete-detalle-component.html',
  styleUrl: './paquete-detalle-component.scss',
})
export class PaqueteDetalleComponent implements OnInit {
  paquete: any;

  constructor(private route: ActivatedRoute, private servicio: Paqueteservice){}
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.paquete = this.servicio.getPaquete(id);
  }


}
