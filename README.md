# Sistema de Administración y Control de Activos Tecnológicos - Frontend (Angular)

## 🎯 Objetivo del Proyecto
> ⚠️ **NOTA DE ALCANCE:** Este sistema ha sido desarrollado exclusivamente como una **versión Demo / Prueba de Concepto (PoC)** con fines demostrativos y de validación de interfaz de usuario. No interactúa con servidores de producción ni opera con datos reales del instituto.
>
Este proyecto constituye la interfaz gráfica de usuario (UI) diseñada para la gestión visual, filtrado avanzado y descarga de reportes del inventario de activos tecnológicos del **IMSS (Instituto Mexicano del Seguro Social)**. La aplicación implementa los patrones de diseño web más modernos para ofrecer una experiencia fluida, reactiva y de alto rendimiento al operador del sistema.

---

## 🛠️ Stack Tecnológico
* **Framework Principal:** Angular 19 (Arquitectura moderna basada en componentes *Standalone*).
* **Manejo de Estado:** Angular **Signals** (Garantizando flujos de datos síncronos y reactividad fina).
* **Rendimiento:** Detección de cambios **Pure Zoneless** (Sin la sobrecarga de `Zone.js`, optimizando el renderizado nativo).
* **Estilos y Maquetación:** CSS Grid y Flexbox estructurado nativamente para cumplir con lineamientos visuales institucionales.

---

## ⚙️ Características Técnicas Implementadas

* **Panel de Búsqueda Avanzada:** Componente dinámico multi-criterio que unifica búsquedas por Marca, Modelo, Número de Serie, Estado Operativo y Rangos de Costo.
* **Control de Cortocircuito por ID:** Lógica reactiva que deshabilita los campos multi-criterio en cuanto se detecta la entrada de un Identificador Único (UUID), previniendo consultas redundantes.
* **Manejo de Credenciales Seguro:** Integración con cookies perimetrales mediante configuraciones nativas de transmisión segura de sesiones de usuario hacia la API Core.
* **Procesamiento de Binarios en Memoria:** Algoritmo en TypeScript encargado de interceptar respuestas en Base64, transformarlas en arreglos de bytes estructurados (`Uint8Array`) y compilar dinámicamente un archivo ejecutable de descarga en formato `Blob` para el navegador (`.zip`).

---

## 🚀 Requisitos y Comandos para Desplegar el Proyecto

Asegúrate de contar con **Node.js** (versión LTS recomendada) y el **Angular CLI** instalado globalmente en tu equipo antes de arrancar.

### 1. Instalar las dependencias del proyecto:
Sitúate en la raíz del proyecto de Angular (donde se encuentra el archivo `package.json`) y ejecuta:
```bash
npm install
```
2. Levantar el servidor de desarrollo local:
```bash
ng serve
```
El servidor compilará los módulos de forma asíncrona y la aplicación estará disponible en tu navegador web ingresando a:

http://localhost:4200

🌐 Configuración de Comunicación (CORS y Credenciales)

Para que el panel de Angular interactúe correctamente con el Backend de Spring Boot durante las pruebas locales, se deben considerar los siguientes puntos:

 1   Uso de Cookies (HttpOnly): Dado que el backend deposita la sesión en una cookie llamada authToken, todas las peticiones HTTP del servicio de Angular (HttpClient) dirigidas a endpoints protegidos están configuradas con el modificador de seguridad:
```bash
{ withCredentials: true }
```
2    Detección de Cambios Moderna: El proyecto se ejecuta con la bandera experimental de alto rendimiento activada en el app.config.ts:

```bash
provideExperimentalZonelessChangeDetection()
```
(Nota: El archivo angular.json ha sido liberado de la carga de zone.js en la sección de polyfills para habilitar por completo los beneficios de velocidad del modo Zoneless).





