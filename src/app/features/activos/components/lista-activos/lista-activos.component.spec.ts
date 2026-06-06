import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaActivosComponent } from './lista-activos.component';

describe('ListaActivosComponent', () => {
  let component: ListaActivosComponent;
  let fixture: ComponentFixture<ListaActivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaActivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaActivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
