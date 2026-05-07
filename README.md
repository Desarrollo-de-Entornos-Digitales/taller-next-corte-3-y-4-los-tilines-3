# Proyecto Taller Next.js - Corte 3 y 4

Este proyecto consiste en una aplicacion frontend desarrollada con Next.js que se integra con un backend en NestJS. La plataforma permite la gestion de usuarios, autenticacion y visualizacion de un feed de modulos de aprendizaje con seguimiento de progreso.

## Instrucciones de Ejecucion

### Requisitos Previos
Es necesario tener instalado Node.js y Docker Desktop para el manejo de la base de datos y el backend.

### Configuracion del Backend
1. Navegar a la carpeta del backend.
2. Ejecutar el comando para levantar los servicios:
   docker-compose up --build
3. Para cargar los datos de prueba, ejecutar el script SQL incluido:
   Get-Content seed.sql | docker exec -i postgres-db psql -U postgres -d mydatabase

### Configuracion del Frontend
1. Navegar a la carpeta del frontend.
2. Instalar las dependencias:
   npm install
3. Iniciar el servidor de desarrollo:
   npm run dev
4. Acceder a la aplicacion en http://localhost:3000

## Funcionalidades Implementadas

### 1. Autenticacion Completa
Se implemento un flujo de acceso seguro que incluye:
- Registro de nuevos usuarios con asignacion dinamica de roles desde la base de datos.
- Inicio de sesion validando credenciales contra el backend.
- Cierre de sesion que limpia la sesion del navegador y protege las rutas privadas.

### 2. Feed Dinamico de Modulos
La pantalla principal consume datos reales del backend para mostrar:
- Lista de modulos organizados por su estado (Pendientes, En curso y Completados).
- Barra de progreso visual y porcentaje de completitud para cada elemento.
- Filtrado por cursos segun las inscripciones del usuario logueado.

### 3. Sistema de Paginacion
Se investigo e implemento una estrategia de paginacion por offset. El frontend solicita un limite especifico de elementos por pagina y permite la navegacion entre ellas mediante controles de usuario, optimizando la carga de datos.

## Detalles Tecnicos

### Gestion de Autenticacion y JWT
La seguridad se basa en tokens JWT (JSON Web Tokens). Al iniciar sesion, el backend retorna un token que se almacena en el localStorage del navegador. Para las peticiones que requieren autorizacion, se utiliza un cliente de Axios configurado con interceptores que adjuntan automaticamente el token en las cabeceras de autorizacion (Bearer token).

### Gestion del Estado y Componentes
La gestion del estado se realiza de forma local y mediante hooks de React como useState y useEffect para manejar la informacion del usuario y el contenido del feed. 

Se construyo una base de mas de 10 componentes reutilizables, entre los que destacan:
- Campos de entrada especializados (EmailInput, PasswordInput).
- Botones configurables.
- Cards para el renderizado de modulos.
- Barra de navegacion dinamica.
- Hero y secciones de contenido.

### Organizacion del Proyecto
El codigo sigue una estructura limpia separando responsabilidades:
- /components: Componentes visuales reutilizables.
- /app: Logica de paginas y servicios de API.
- /lib: Configuracion de clientes y librerias externas.
