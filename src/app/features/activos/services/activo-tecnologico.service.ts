import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';

import {Router} from '@angular/router';
import { ActivoTecnologico } from '../../../core/models/activo-tecnologico';
import {EstadoActivo} from '../../../core/models/estado-activo';
import {ReporteResponse} from '../../../core/models/reporte-response';
import {Categoria} from '../../../core/models/categoria';
import {PageResponse} from '../../../core/models/page-response';
import {CriteriosBusqueda} from '../../../core/models/CriteriosBusqueda';

@Injectable({
  providedIn: 'root'
})
export class ActivoTecnologicoService {
  // 1. Inyectamos el HttpClient
  private readonly http = inject(HttpClient);

  // 2. Definimos la URL base de tu API Gateway o Spring Boot Local
  private readonly apiUrl = 'http://localhost:8080/api/v1/activos-tecnologicos';
  private readonly apiUrlCategoria = 'http://localhost:8080/api/v1/categoria';


  /**
   * Consume el endpoint dinámico del backend enviando los filtros activos como Query Params.
   * El backend responde con la estructura Page nativa de Spring Data.
   * * @param filtros Criterios de búsqueda seleccionados en el panel superior.
   * @param pagina Número de página solicitado (índice basado en 0).
   * @param tamano Cantidad de registros por página.
   */
  buscarActivosPaginados(filtros: CriteriosBusqueda, pagina: number, tamano: number): Observable<PageResponse<ActivoTecnologico>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('size', tamano.toString());
    if (filtros.idActivo && filtros.idActivo.trim() !== '') {
      params = params.set('idActivo', filtros.idActivo.trim());
    } else {
      // Si no hay ID, barremos el resto de los filtros multi-criterio
      if (filtros.marcaModelo && filtros.marcaModelo.trim() !== '') {
        params = params.set('marcaModelo', filtros.marcaModelo.trim());
      }
      if (filtros.numeroSerie && filtros.numeroSerie.trim() !== '') {
        params = params.set('numeroSerie', filtros.numeroSerie.trim());
      }
      if (filtros.estado && (filtros.estado as string) !== '') {
        params = params.set('estado', filtros.estado);
      }
      if (filtros.costoDesde !== undefined && filtros.costoDesde !== null) {
        params = params.set('costoDesde', filtros.costoDesde.toString());
      }
      if (filtros.costoHasta !== undefined && filtros.costoHasta !== null) {
        params = params.set('costoHasta', filtros.costoHasta.toString());
      }
    }

    // Petición GET limpia hacia tu endpoint documentado con OpenAPI
    return this.http.get<PageResponse<ActivoTecnologico>>(`${this.apiUrl}/buscar`, { params });
  }

  generarReporteZip(filtros: CriteriosBusqueda): Observable<ReporteResponse> {
    let params = new HttpParams();

    // Mapeamos exactamente los mismos filtros multi-criterio
    if (filtros.marcaModelo && filtros.marcaModelo.trim() !== '') {
      params = params.set('marcaModelo', filtros.marcaModelo.trim());
    }
    if (filtros.numeroSerie && filtros.numeroSerie.trim() !== '') {
      params = params.set('numeroSerie', filtros.numeroSerie.trim());
    }
    if (filtros.estado && filtros.estado as string !== '') {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.costoDesde !== undefined && filtros.costoDesde !== null) {
      params = params.set('costoDesde', filtros.costoDesde.toString());
    }
    if (filtros.costoHasta !== undefined && filtros.costoHasta !== null) {
      params = params.set('costoHasta', filtros.costoHasta.toString());
    }

    // asegúrate de tener configurado { withCredentials: true } si fuera necesario para los CORS.
    return this.http.get<ReporteResponse>(`${this.apiUrl}/reportes/download`, { params });
  }


  /**
   * GET /api/v1/activos-tecnologicos
   * Recupera la lista completa de activos registrados en el IMSS.
   */
  listarTodos(page: number = 0, size: number = 5): Observable<PageResponse<ActivoTecnologico>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // 🔥 Arreglado: Ahora sí le inyectamos los HttpParams a la petición saliente
    return this.http.get<PageResponse<ActivoTecnologico>>(this.apiUrl, { params });
  }

  /**
   * GET /api/v1/categoria
   * Recupera la lista completa de categorías registrados en el IMSS.
   */
  listarTodosCategoria(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrlCategoria);
  }

  /**
   * GET /api/v1/activos-tecnologicos/{id}
   * Busca un activo en específico mediante su UUID técnico.
   */
  obtenerPorId(idActivo: string): Observable<ActivoTecnologico> {
    return this.http.get<ActivoTecnologico>(`${this.apiUrl}/${idActivo}`);
  }

  /**
   * POST /api/v1/activos-tecnologicos?idCategoria=X
   * Registra un nuevo activo mapeándolo a una categoría obligatoria.
   */
  crearActivo(activo: Partial<ActivoTecnologico>, idCategoria: number): Observable<ActivoTecnologico> {
    const params = new HttpParams().set('idCategoria', idCategoria.toString());
    return this.http.post<ActivoTecnologico>(this.apiUrl, activo, { params });
  }

  /**
   * PUT /api/v1/activos-tecnologicos/{id}
   * Modifica los atributos generales de un activo en base a su UUID.
   */
  actualizarActivo(idActivo: string, datosActualizados: ActivoTecnologico): Observable<ActivoTecnologico> {
    return this.http.put<ActivoTecnologico>(`${this.apiUrl}/${idActivo}`, datosActualizados);
  }

  /**
   * PATCH /api/v1/activos-tecnologicos/{id}/estado?nuevoEstado=BAJA
   * Modifica puntualmente el estado operativo del activo tecnológico.
   */
  cambiarEstado(idActivo: string, nuevoEstado: EstadoActivo): Observable<ActivoTecnologico> {
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);

    // Al ser un PATCH, mandamos un objeto vacío '{}' como cuerpo de la petición,
    // ya que el dato real viaja en el Query String.
    return this.http.patch<ActivoTecnologico>(`${this.apiUrl}/${idActivo}/estado`, {}, { params });
  }

  /**
   * GET /api/v1/activos-tecnologicos/reportes/download
   * Genera y descarga el reporte consolidado en un archivo ZIP codificado en Base64.
   */
  descargarReporte(estado?: EstadoActivo, idCategoria?: number): Observable<ReporteResponse> {
    let params = new HttpParams();

    // Como los filtros son opcionales (required = false en Java),
    // validamos si existen antes de agregarlos a la petición.
    if (estado) {
      params = params.set('estado', estado);
    }
    if (idCategoria) {
      params = params.set('idCategoria', idCategoria.toString());
    }

    // Importamos e indicamos que la respuesta mapeará con la interfaz ReporteResponse
    return this.http.get<ReporteResponse>(`${this.apiUrl}/reportes/download`, { params });
  }

}
