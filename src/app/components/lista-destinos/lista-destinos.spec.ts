import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDestinos } from './lista-destinos';

describe('ListaDestinos', () => {
  let component: ListaDestinos;
  let fixture: ComponentFixture<ListaDestinos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaDestinos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDestinos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
