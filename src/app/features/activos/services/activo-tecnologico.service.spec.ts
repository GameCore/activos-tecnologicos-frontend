import { TestBed } from '@angular/core/testing';

import { ActivoTecnologicoService } from './activo-tecnologico.service';

describe('ActivoTecnologicoService', () => {
  let service: ActivoTecnologicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivoTecnologicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
