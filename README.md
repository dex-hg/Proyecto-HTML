# Chaufa D Ming

Sitio web académico para un restaurante de comida chifa. El proyecto permite consultar la carta, buscar platos, administrar un carrito de compras, registrar clientes, iniciar y cerrar sesión, y guardar en MySQL el resumen de los pedidos realizados.

## Características

- Página principal con carrusel de promociones accesible y adaptable a dispositivos táctiles.
- Carta completa organizada por promociones, chaufas, clásicos, tallarines, asados y bebidas.
- Búsqueda de platos por nombre, con filtrado en tiempo real.
- Carrito persistente en el navegador mediante `localStorage`.
- Registro de clientes con validación de datos y contraseñas protegidas con `password_hash()`.
- Inicio de sesión, consulta del estado de la sesión y cierre de sesión.
- Identificación del usuario autenticado en la barra de navegación.
- Registro del resumen de cada pedido en MySQL para el cliente autenticado.
- Página de locales con estado abierto/cerrado calculado en la zona horaria de Lima.
- Secciones informativas de historia, locales y libro de reclamaciones.

## Tecnologías utilizadas

| Capa                      | Tecnologías                 |
| ------------------------- | ---------------------------- |
| Interfaz                  | HTML5 y CSS3                 |
| Interactividad            | JavaScript                   |
| Servidor                  | PHP 8.1 o superior           |
| Base de datos             | MySQL o MariaDB              |
| Acceso a datos            | PDO con consultas preparadas |
| Entorno local recomendado | XAMPP                        |

El proyecto no utiliza Node.js ni requiere instalar dependencias externas.

## Estructura del proyecto

```text
Proyecto-HTML/
|-- index.html                  # Página principal
|-- html/                       # Carta y vistas secundarias
|-- estilos/                    # Hojas de estilos
|-- javascript/                 # Carrito, búsqueda, sesiones y UI
|-- php/                        # Registro, autenticación y pedidos
|-- configuracion/
|   |-- conexion.php            # Conexión PDO a MySQL
|   |-- sesion.php              # Configuración compartida de sesiones
|-- base de datos/
|   |-- restaurante_d_ming.sql  # Esquema de clientes y pedidos
|-- recursos/                   # Imágenes, banners e iconos
```

## Requisitos

- Apache con PHP 8.1 o una versión posterior.
- Extensión PDO para MySQL habilitada en PHP.
- MySQL o MariaDB.
- Un navegador web moderno.
- XAMPP es la opción recomendada para ejecutar todo el entorno localmente.

## Instalación local con XAMPP

1. Clona el repositorio dentro de la carpeta `htdocs` de XAMPP:

   ```powershell
   cd C:\xampp\htdocs
   git clone https://github.com/dex-hg/Proyecto-HTML.git
   ```
2. Abre el panel de control de XAMPP e inicia los servicios **Apache** y **MySQL**.
3. Entra a [http://localhost/phpmyadmin](http://localhost/phpmyadmin) y crea una base de datos llamada `restaurante_d_ming` con codificación `utf8mb4`.
4. Selecciona la base de datos creada e importa el archivo:

   ```text
   base de datos/restaurante_d_ming.sql
   ```
5. Revisa los datos de conexión de `configuracion/conexion.php`. La configuración incluida corresponde a una instalación local típica de XAMPP:

   ```text
   Host: 127.0.0.1
   Puerto: 3306
   Base de datos: restaurante_d_ming
   Usuario: root
   Contraseña: vacía
   ```
6. Abre el proyecto desde:

   [http://localhost/Proyecto-HTML/](http://localhost/Proyecto-HTML/)

> [!IMPORTANT]
> No abras las páginas mediante una ruta `file:///`. El registro, el inicio de sesión y los pedidos necesitan ejecutarse a través de Apache para que PHP pueda procesar las solicitudes.

## Flujo principal

1. El visitante explora o busca platos en la carta.
2. Los productos seleccionados se guardan en el carrito del navegador.
3. El usuario crea una cuenta o inicia sesión.
4. Al finalizar la compra, el servidor identifica al cliente mediante la sesión activa.
5. PHP valida la solicitud y registra en la tabla `pedidos` la cantidad total de unidades y el monto.

## Base de datos

El esquema contiene dos tablas:

- `clientes`: almacena los datos de registro y el hash de la contraseña.
- `pedidos`: almacena el cliente asociado, el total de unidades, la fecha y el monto del pedido.

La relación entre ambas se mantiene mediante la clave foránea `pedidos.id_cliente`.

## Consideraciones de seguridad

- Las contraseñas se guardan mediante `password_hash()` y se verifican con `password_verify()`.
- Las operaciones de base de datos utilizan consultas preparadas con PDO.
- El identificador del cliente se obtiene de la sesión en el servidor, no de datos enviados por el navegador.
- La sesión regenera su identificador después de autenticar al usuario.
- La cookie de sesión utiliza las opciones `HttpOnly` y `SameSite=Lax`.

Las credenciales incluidas en `configuracion/conexion.php` están pensadas exclusivamente para un entorno local. Deben reemplazarse y protegerse antes de cualquier despliegue real.

## Alcance actual

Este repositorio es un prototipo académico y no una plataforma de comercio electrónico lista para producción.

- El carrito se conserva en `localStorage` y pertenece al navegador utilizado.
- La base de datos guarda el resumen del pedido, pero no el detalle individual de los platos.
- El libro de reclamaciones representa la interfaz del formulario; actualmente no persiste sus datos en el servidor.
- Los enlaces a redes sociales son demostrativos.

## Créditos

- Desarrollo y mantenimiento del repositorio: [dex-hg](https://github.com/dex-hg).
- Agradecimiento especial a [That1nus](https://github.com/That1nus), quien colaboró de manera importante en el desarrollo inicial del HTML y CSS cuando el proyecto todavía no se encontraba publicado en un repositorio de GitHub.

## Aviso sobre recursos de terceros

Algunas imágenes y recursos gráficos utilizados en este proyecto fueron obtenidos de fuentes disponibles en internet. Se incluyen exclusivamente con fines académicos, educativos y demostrativos, sin propósito comercial.

Los derechos de autor y demás derechos sobre dichos recursos pertenecen a sus respectivos autores o titulares. Este repositorio no pretende atribuirse su autoría ni concede una licencia sobre ellos. Si eres titular de alguno de estos recursos y deseas solicitar su atribución, sustitución o retiro, puedes comunicarlo mediante una incidencia en el repositorio.
