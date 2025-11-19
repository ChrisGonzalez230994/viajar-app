import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationHighlights } from './destination-highlights';

describe('DestinationHighlights', () => {
  let component: DestinationHighlights;
  let fixture: ComponentFixture<DestinationHighlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DestinationHighlights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationHighlights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
