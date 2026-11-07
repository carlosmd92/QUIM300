# QUIM300 Fisicoquímica Aplicada

Resúmenes interactivos de estudio para el curso QUIM300 Fisicoquímica Aplicada, Universidad Andrés Bello, semestre 2026-2. Cada resumen es una página HTML que se abre en el navegador, sin instalación, con ecuaciones en MathJax, gráficos interactivos y autoevaluación. Cada uno tiene además un PDF descargable.

Sitio web: https://carlosmd92.github.io/QUIM300/

## Resúmenes

| Tema | Página | PDF | Contenido |
|---|---|---|---|
| Cinética química I | [kinetica_velocidades.html](kinetica_velocidades.html) | [PDF](pdf/kinetica_velocidades.pdf) | Velocidad de reacción media e instantánea, velocidades de aparición y consumo, ley de velocidad y órdenes de reacción, método de las velocidades iniciales. |
| Cinética química II | [kinetica_integradas.html](kinetica_integradas.html) | [PDF](pdf/kinetica_integradas.pdf) | Ecuaciones de velocidad integradas, tiempo de vida media, determinación del orden (ecuaciones integradas y vida media), dependencia de la constante de velocidad con la temperatura (Arrhenius). |
| Fisicoquímica de superficies | [superficies.html](superficies.html) | [PDF](pdf/superficies.pdf) | Interfase y tensión superficial, ecuación de Young&ndash;Laplace, ecuación de Kelvin, capilaridad, tensión superficial en disoluciones e isoterma de adsorción de Gibbs. |

## Uso

Abrir el sitio web, o descargar el repositorio y abrir `index.html` en el navegador. Las ecuaciones se cargan con MathJax desde un CDN, por lo que se requiere conexión a internet.

## Estructura

```
index.html            portada con la lista de resúmenes
*.html                un resumen por página
css/base.css          estilos compartidos y hoja de estilos de impresión
js/base.js            navegación, autoevaluación, gráficos y utilidades compartidas
pdf/                  PDF de cada resumen
herramientas/         script para regenerar los PDF
```

## Agregar un resumen

1. Crear la página nueva a partir de una existente: contiene solo las secciones (`<section class="card" id="...">`) y un bloque `QUIM.init({...})` con el título, las secciones y el banco de preguntas.
2. Agregar su nombre a la lista `$paginas` de `herramientas/generar_pdfs.ps1`.
3. Agregar su enlace en `index.html` y una fila en la tabla de este README.
4. Generar los PDF y subir los cambios.

## Generar los PDF

Los PDF se generan con Microsoft Edge en modo headless a partir de la hoja de estilos de impresión, con todas las secciones y sin la autoevaluación. Desde PowerShell, en la carpeta del repositorio:

```powershell
.\herramientas\generar_pdfs.ps1
```

Hay que regenerarlos cada vez que cambie el contenido de una página.

## Autor

Prof. Carlos Morales
