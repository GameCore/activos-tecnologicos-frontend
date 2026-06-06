import { EstadoActivo } from './estado-activo';
import { Categoria } from './categoria';

export interface ActivoTecnologico {
  idActivo?: string;               // UUID de Java
  folioInventario: string;
  numeroSerie: string;
  marcaModelo: string;
  estado: EstadoActivo;
  costoAdquisicion: number;
  fechaIngreso: Date | string
  categoria?: Categoria;
}
