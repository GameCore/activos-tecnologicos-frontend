import {EstadoActivo} from './estado-activo';

export interface CriteriosBusqueda {
  idActivo?: string;
  marcaModelo?: string;
  numeroSerie?: string;
  estado?: EstadoActivo | '';
  costoDesde?: number | null;
  costoHasta?: number | null;
}
