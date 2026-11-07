# QUIM300 Fisicoquímica Aplicada

Resúmenes interactivos de estudio para el curso QUIM300 Fisicoquímica Aplicada, Universidad Andrés Bello, semestre 2026-2. Cada resumen es una página HTML que se abre en el navegador, sin instalación, con ecuaciones en MathJax, visualizaciones que responden y autoevaluación. Cada uno tiene además un resumen en PDF descargable, escrito en LaTeX.

Sitio web: https://carlosmd92.github.io/QUIM300/

## Resúmenes

| Tema | Página | PDF | Contenido |
|---|---|---|---|
| Cinética química I | [kinetica_velocidades.html](kinetica_velocidades.html) | [PDF](pdf/kinetica_velocidades.pdf) | Velocidad de reacción media e instantánea, velocidades de aparición y consumo, ley de velocidad y órdenes de reacción, método de las velocidades iniciales. |
| Cinética química II | [kinetica_integradas.html](kinetica_integradas.html) | [PDF](pdf/kinetica_integradas.pdf) | Ecuaciones de velocidad integradas, determinación del orden por ajuste y por el tiempo de vida media, y dependencia de la constante de velocidad con la temperatura (Arrhenius). |
| Fisicoquímica de superficies | [superficies.html](superficies.html) | [PDF](pdf/superficies.pdf) | Interfase y tensión superficial, ecuación de Young&ndash;Laplace, ecuación de Kelvin, capilaridad, tensión superficial en disoluciones e isoterma de adsorción de Gibbs. |

## Uso

Abrir el sitio web, o descargar el repositorio y abrir `index.html` en el navegador. Las ecuaciones se cargan con MathJax desde un CDN, por lo que se requiere conexión a internet.

## Estructura

```
index.html            portada con la lista de resúmenes
*.html                un resumen interactivo por página
css/base.css          estilos compartidos
js/base.js            navegación, autoevaluación, gráficos y utilidades compartidas
pdf/                  resumen en PDF de cada tema: .tex (fuente) y .pdf
pdf/resumen.sty       plantilla LaTeX común (cabecera, pie, cajas de ecuaciones)
herramientas/         script para compilar los PDF
```

## Agregar un resumen

1. Crear la página nueva a partir de una existente: contiene solo las secciones (`<section class="card" id="...">`) y un bloque `QUIM.init({...})` con el título, las secciones y el banco de preguntas.
2. Escribir su resumen en LaTeX como `pdf/<nombre>.tex` con `\usepackage{resumen}`, con el mismo nombre base que la página.
3. Agregar su enlace en `index.html` y una fila en la tabla de este README.
4. Compilar los PDF y subir los cambios.

## Generar los PDF

Los PDF son documentos LaTeX propios, de 2 a 3 páginas por tema, y no la página impresa. Se compilan con MiKTeX desde PowerShell, en la carpeta del repositorio:

```powershell
.\herramientas\compilar_pdfs.ps1
```

El botón de descarga de cada página enlaza a `pdf/<nombre>.pdf`. Hay que recompilar cuando cambie un `.tex`.

## Autor

Prof. Carlos Morales
