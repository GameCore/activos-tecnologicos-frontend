import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivoTecnologicoService } from '../../services/activo-tecnologico.service';
import { ActivoTecnologico } from '../../../../core/models/activo-tecnologico';
import { Categoria } from '../../../../core/models/categoria';
import {EstadoActivo} from '../../../../core/models/estado-activo';
import {CriteriosBusqueda} from '../../../../core/models/CriteriosBusqueda';

@Component({
  selector: 'app-lista-activos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-activos.component.html',
  styleUrl: './lista-activos.component.scss'
})
export class ListaActivosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activoService = inject(ActivoTecnologicoService);

  // Estados reactivos para la lista y la vista
  activos = signal<ActivoTecnologico[]>([]);
  cargandoLista = signal<boolean>(false);

  // Estados para el Formulario de Nuevo Activo
  mostrarFormulario = signal<boolean>(false); // Controla si se ve el modal/formulario
  guardando = signal<boolean>(false);
  errorFormMsg = signal<string | null>(null);
  exitoFormMsg = signal<string | null>(null);

  // Categorías institucionales para el select
  categorias = signal<Categoria[]>([]);

  //señales de control para la paginación
  paginaActual = signal<number>(0);
  esUltimaPagina = signal<boolean>(false);
  esPrimeraPagina = signal<boolean>(true);
  tamanoPagina = signal<number>(5);

  // Control de la fila editable
  idFilaEnEdicion = signal<string | null | undefined>(null);
  //Señales para mensajes de feedback específicos de la edición en tabla
  errorFilaMsg = signal<string | null>(null);
  exitoFilaMsg = signal<string | null>(null);

  generandoReporte = signal<boolean>(false);



  //FORMULARIO PARA EL PANEL DE BÚSQUEDA AVANZADA
  formFiltros = this.fb.group({
    idActivo: [''],
    marcaModelo: [''],
    numeroSerie: [''],
    estado: [''], // String vacío por defecto para la opción "Seleccione un estado"
    costoDesde: [null as number | null],
    costoHasta: [null as number | null]
  });

  // Formulario Reactivo integrado
  formularioActivo = this.fb.nonNullable.group({
    numeroSerie: ['', [Validators.required, Validators.maxLength(255)]],
    marcaModelo: ['', [Validators.required, Validators.maxLength(255)]],
    costoAdquisicion: [0, [Validators.required, Validators.min(0)]],
    idCategoria: ['', [Validators.required]]
  });

  estadosDisponibles: EstadoActivo[] = ['DISPONIBLE', 'ASIGNADO', 'EN_MANTENIMIENTO', 'BAJA'];
// Formulario Inline acoplado
  formFila = this.fb.nonNullable.group({
    marcaModelo: ['', [Validators.required, Validators.maxLength(255)]],
    numeroSerie: ['', [Validators.required, Validators.maxLength(100)]],
    costoAdquisicion: [0, [Validators.required, Validators.min(0)]],
    estado: ['DISPONIBLE' as EstadoActivo, [Validators.required]]
  });
  // Es un grupo de formularios vacío para las filas que se quedan en modo lectura
  formularioVacio = this.fb.group({});


  constructor() {
    // ESCUCHA REACTIVA (SHORT-CIRCUIT) PARA BLOQUEAR CAMPOS
    // Monitorizamos el campo idActivo en tiempo real
    this.formFiltros.get('idActivo')?.valueChanges.subscribe(id => {
      const camposMultiCriterio = ['marcaModelo', 'numeroSerie', 'estado', 'costoDesde', 'costoHasta'];

      if (id && id.trim() !== '') {
        // Si hay un ID escrito, limpiamos y deshabilitamos el resto de los filtros
        camposMultiCriterio.forEach(controlName => {
          const control = this.formFiltros.get(controlName);
          if (control && control.enabled) {
            control.setValue(null, { emitEvent: false }); // Evitamos bucles de eventos
            control.disable({ emitEvent: false });
          }
        });
      } else {
        // Si el ID está vacío, volvemos a habilitar todos los filtros multi-criterio
        camposMultiCriterio.forEach(controlName => {
          const control = this.formFiltros.get(controlName);
          if (control && control.disabled) {
            control.enable({ emitEvent: false });
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.cargarActivos();
    this.cargarCategorias();
  }


  cargarActivos(): void {
    this.cargandoLista.set(true);
    this.errorFilaMsg.set(null);

    // Extraemos los valores del formulario de búsqueda (incluye los disabled gracias a getRawValue)
    const criterios = this.formFiltros.getRawValue() as CriteriosBusqueda;

    this.activoService.buscarActivosPaginados(
      criterios,
      this.paginaActual(),
      this.tamanoPagina()
    ).subscribe({
      next: (response) => {
        this.cargandoLista.set(false);
        // Sincronizamos los datos devueltos por tu PageResponse corporativo
        this.activos.set(response.content);
        this.esPrimeraPagina.set(response.first);
        this.esUltimaPagina.set(response.last);
      },
      error: (err) => {
        this.cargandoLista.set(false);
        if (err.error && err.error.message) {
          this.errorFilaMsg.set(err.error.message);
        } else {
          this.errorFilaMsg.set('Error institucional al consultar el inventario filtrado.');
        }
      }
    });
  }

  //CONTROLES DE PAGINACIÓN ADAPTADOS A LOS FILTROS
  ejecutarBusqueda(): void {
    this.paginaActual.set(0); // Reiniciamos a la primera página al buscar algo nuevo
    this.cargarActivos();
  }

  limpiarFiltros(): void {
    this.formFiltros.reset({
      idActivo: '',
      marcaModelo: '',
      numeroSerie: '',
      estado: '',
      costoDesde: null,
      costoHasta: null
    });
    this.paginaActual.set(0);
    this.cargarActivos();
  }

  // Métodos para navegar entre páginas
  paginaSiguiente(): void {
    if (!this.esUltimaPagina()) {
      this.paginaActual.update(p => p + 1); // Incrementamos la página
      this.cargarActivos(); // Volvemos a consultar al back
    }
  }

  paginaAnterior(): void {
    if (!this.esPrimeraPagina()) {
      this.paginaActual.update(p => p - 1); // Decrementamos la página
      this.cargarActivos(); // Volvemos a consultar al back
    }
  }


  activarEdicionInline(activo: ActivoTecnologico): void {
    // Limpiamos alertas previas al abrir una nueva fila
    this.errorFilaMsg.set(null);
    this.exitoFilaMsg.set(null);

    this.idFilaEnEdicion.set(activo.idActivo);

    this.formFila.setValue({
      marcaModelo: activo.marcaModelo,
      numeroSerie: activo.numeroSerie,
      costoAdquisicion: activo.costoAdquisicion,
      estado: activo.estado as EstadoActivo
    });
  }

  cancelarEdicionInline(): void {
    this.idFilaEnEdicion.set(null);
    this.errorFilaMsg.set(null);
    this.formFila.reset();
  }

  guardarEdicionInline(): void {
    const idActivo = this.idFilaEnEdicion();

    // Defensa por si acaso (Short-circuit)
    if (!idActivo) {
      this.errorFilaMsg.set('No se encontró una fila activa en edición.');
      return;
    }

    if (this.formFila.invalid) {
      this.formFila.markAllAsTouched();
      this.errorFilaMsg.set('Por favor, rellene todos los campos obligatorios con formatos válidos.');
      return;
    }

    this.guardando.set(true);
    this.errorFilaMsg.set(null); // Reseteamos errores previos
    this.exitoFilaMsg.set(null);

    const valoresEditados = this.formFila.getRawValue();

    this.activoService.actualizarActivo(idActivo, valoresEditados as ActivoTecnologico).subscribe({
      next: () => {
        this.guardando.set(false);
        this.idFilaEnEdicion.set(null); // Cerramos el modo edición

        // Mensaje temporal de éxito en la vista general
        this.exitoFilaMsg.set('Registro actualizado correctamente en el inventario.');
        this.cargarActivos(); // Recargamos la tabla para ver reflejado el cambio y el nuevo Badge

        // Limpiamos el mensaje de éxito tras unos segundos
        setTimeout(() => this.exitoFilaMsg.set(null), 3000);
      },
      error: (err) => {
        this.guardando.set(false);

        //CAPTURA REACTIVA DEL JSON DE ERROR DEL BACKEND:
        // Evaluamos si el backend mandó la estructura {"message": "...", "status": 400}
        if (err.error && err.error.message) {
          this.errorFilaMsg.set(err.error.message); // Muestra "El número de serie ya está registrado."
        } else {
          this.errorFilaMsg.set('No se pudieron guardar los cambios. Error interno del servidor.');
        }
      }
    });
  }

  cargarCategorias(): void {
    this.activoService.listarTodosCategoria().subscribe({
      next: (data) => {
        this.categorias.set(data); // Seteamos el valor de forma reactiva al signal
      },
      error: (err) => {
        console.error('Error al recuperar el catálogo de categorías:', err);
      }
    });
  }

  abrirModal(): void {
    this.formularioActivo.reset({ costoAdquisicion: 0, numeroSerie: '', marcaModelo: '', idCategoria: '' });
    this.errorFormMsg.set(null);
    this.exitoFormMsg.set(null);
    this.mostrarFormulario.set(true);
  }

  cerrarModal(): void {
    this.mostrarFormulario.set(false);
  }

  guardarNuevoActivo(): void {
    if (this.formularioActivo.invalid) {
      this.formularioActivo.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorFormMsg.set(null);

    const rawValores = this.formularioActivo.getRawValue();

    // Mapeo limpio usando tu interfaz ActivoTecnologico
    const nuevoActivo: Partial<ActivoTecnologico> = {
      numeroSerie: rawValores.numeroSerie,
      marcaModelo: rawValores.marcaModelo,
      costoAdquisicion: rawValores.costoAdquisicion
    };

    const idCategoriaSeleccionada = Number(rawValores.idCategoria);

    this.activoService.crearActivo(nuevoActivo, idCategoriaSeleccionada).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exitoFormMsg.set('Activo guardado exitosamente.');

        // Recargamos la tabla de inmediato para ver el nuevo registro
        this.cargarActivos();

        // Cerramos el modal automáticamente tras 1.5 segundos
        setTimeout(() => {
          this.cerrarModal();
        }, 1500);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.error && err.error.message) {
          this.errorFormMsg.set(err.error.message);
        } else {
          // Mensaje de respaldo por si ocurre un fallo de red crudo (ej. servidor apagado)
          this.errorFormMsg.set('Error de comunicación con el servidor institucional.');
        }
      }
    });
  }

  descargarReporteInventario(): void {
    this.generandoReporte.set(true);
    this.errorFilaMsg.set(null); // Limpiamos alertas previas

    // Extraemos los filtros actuales de la pantalla
    const criterios = this.formFiltros.getRawValue() as CriteriosBusqueda;

    this.activoService.generarReporteZip(criterios).subscribe({
      next: (response) => {
        this.generandoReporte.set(false);

        if (response && response.fileBase64) {
          try {
            // 1. Convertimos la cadena Base64 pura en un arreglo de bytes (ArrayBuffer)
            const byteCharacters = atob(response.fileBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // 2. Creamos el BLOB especificando que es un archivo comprimido ZIP
            const blob = new Blob([byteArray], { type: 'application/zip' });

            // 3. Truco del DOM para forzar la descarga nativa en el navegador
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = response.fileName || 'inventario.zip'; // Nombre institucional
            link.click();

            // 4. Liberamos memoria del navegador limpiando el objeto URL creado
            window.URL.revokeObjectURL(url);
            this.exitoFilaMsg.set('¡Reporte institucional descargado con éxito!');
          } catch (err) {
            this.errorFilaMsg.set('Error al procesar y reconstruir el archivo ZIP en el navegador.');
          }
        } else {
          this.errorFilaMsg.set('El servidor no devolvió el contenido binario del reporte.');
        }
      },
      error: (err) => {
        this.generandoReporte.set(false);
        this.errorFilaMsg.set(err.error?.message || 'Fallo de conexión o permisos al compilar el reporte ZIP.');
      }
    });
  }

}
