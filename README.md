# Proyecto Taller Next.js - Corte 3 y 4

Este proyecto consiste en una aplicacion frontend desarrollada con Next.js que se integra con un backend en NestJS. La plataforma permite la gestion de usuarios, autenticacion, visualizacion de un feed de modulos de aprendizaje con seguimiento de progreso, y ahora un completo sistema de gamificacion y evaluacion interactiva.

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

---

## Funcionalidades Implementadas

### 1. Autenticacion Completa
Se implemento un flujo de acceso seguro que incluye:
- Registro de nuevos usuarios con asignacion dinamica de roles desde la base de datos.
- Inicio de sesion validando credenciales contra el backend.
- Cierre de sesion que limpia la sesion del navegador y protege las rutas privadas.

### 2. Feed Dinamico de Modulos y Cursos
La pantalla principal consume datos reales del backend para mostrar:
- Lista de modulos organizados por su estado (Pendientes y En curso).
- Barra de progreso visual y porcentaje de completitud para cada elemento.
- Filtrado por cursos segun las inscripciones del usuario logueado.

### 3. Sistema Gamificado de Logros (CRUD)
Se diseno e implemento un sistema de logros conectado end-to-end con la base de datos:
- Interfaz dedicada para visualizar los logros obtenidos y el total de experiencia (XP).
- Panel de administracion (solo visible y accesible para roles tipo Administrador) que permite **Crear, Leer, Actualizar y Eliminar (CRUD)** los logros del sistema.
- Las vistas estan protegidas para garantizar que los estudiantes no puedan modificar la informacion.

### 4. Interfaz de Arena y Retroalimentacion Inmediata
El modulo practico donde los usuarios resuelven ejercicios:
- Se integra de forma real con el backend mediante el endpoint de evaluacion.
- Si el usuario supera el umbral de experiencia requerida por un logro tras responder correctamente, la aplicacion renderiza instantaneamente una animacion (Modal) celebrando el logro recien desbloqueado.

### 5. Despliegue Funcional
El proyecto se encuentra totalmente preparado para operar en produccion:
- **Backend:** Desplegado en un servicio de alojamiento en la nube (Render) con conexion a PostgreSQL.
- **Frontend:** Desplegado en Vercel, enlazado directamente a la API en la nube usando variables de entorno (`NEXT_PUBLIC_API_URL`).

---

## Detalles Tecnicos

### Gestion de Autenticacion y JWT
La seguridad se basa en tokens JWT (JSON Web Tokens). Al iniciar sesion, el backend retorna un token que se almacena en el localStorage del navegador. Para las peticiones que requieren autorizacion, se utiliza un cliente de Axios configurado con interceptores que adjuntan automaticamente el token en las cabeceras de autorizacion (Bearer token).

### Gestion de Autorizacion (Roles)
El control de acceso basado en roles se resolvio en el frontend evaluando el rol embebido en los datos de sesion del usuario. Aquellos componentes o rutas exclusivos (como `/logros/manage`) verifican dinamicamente si la propiedad `isAdmin` es verdadera antes de renderizar botones administrativos o conceder el acceso a la vista.

### Gestion del Estado y Componentes
La gestion del estado global y de sesion se centralizo utilizando **Context API** (AuthContext), el cual provee a toda la aplicacion el perfil del usuario activo, validaciones de permisos (`isAdmin`) y funciones de autenticacion, resolviendo de forma efectiva el problema del "Prop Drilling".

A nivel local, se combinaron hooks de React como `useState` y `useEffect` para el control de formularios interactivos y el flujo asincrono.

---

## 💎 Calidad del Codigo y Patrones de Diseno

Para cumplir con los mas altos estandares de desarrollo, la aplicacion se construyo teniendo en cuenta los siguientes atributos de calidad exigidos:

### 1. Organizacion Arquitectonica del Proyecto
El codigo sigue una estructura jerarquica y limpia basada en Next.js App Router, garantizando que cada elemento este en su lugar correspondiente:
- `/app`: Contiene estrictamente las rutas y las vistas principales de la aplicacion, organizadas por modulos de negocio (dashboard, logros, arena, cursos).
- `/components`: Aloja todos los componentes visuales e interactivos que son agnosticos al contexto de negocio, facilitando su mantenibilidad.
- `/services`: Funciona como la capa de acceso a datos. Todas las peticiones fetch/axios hacia el backend viven aqui.
- `/context`: Aisla la logica de estado global.
- `/lib`: Almacena configuraciones transversales y dependencias globales (como el cliente HTTP de Axios).

### 2. Nombres de Variables y Componentes Claros
Se aplico una estricta convencion de nomenclatura basada en Clean Code:
- **Componentes e Interfaces:** Se utiliza `PascalCase` para definir tipos y vistas (ej. `SubmitExerciseResult`, `LogrosManagePage`).
- **Variables y Funciones:** Se utiliza `camelCase` con nombres descriptivos en ingles que revelan su intencion sin necesidad de comentarios (ej. `fetchAchievements`, `newlyUnlockedAchievements`, `handleOpenCreate`).
- No existen variables magicas o ambiguas (como `data1` o `x`); todo tiene un contexto semantico.

### 3. Separacion de Responsabilidades (SoC)
Se garantizo que ninguna interfaz grafica estuviera acoplada a la logica de infraestructura HTTP. 
En lugar de escribir `fetch()` dentro de los archivos `page.tsx`, los componentes visuales simplemente mandan llamar funciones predefinidas (ej. `achievementsManageService.create(formData)`). Esto significa que la UI solo se encarga de renderizar, y la capa `/services` se encarga de conectar con la API, facilitando muchisimo el testing y futuras refactorizaciones.

### 4. Uso Adecuado de Componentes Reutilizables
Se construyo un sistema de diseno basado en componentes encapsulados para cumplir el principio DRY (Don't Repeat Yourself):
- **Layouts Globales:** El Navbar y el Sidebar no se repiten en cada archivo, sino que se inyectan a traves de un `layout.tsx` raiz que envuelve a los "children".
- **Componentes UI:** Inputs (`EmailInput`, `PasswordInput`), Tarjetas (`CourseCard`, tarjetas de trofeos) y modales dinamicos se crearon una sola vez y reciben props (parametros) para adaptar su comportamiento o contenido donde se les invoque.

### 5. Consistencia en el Codigo
El equipo mantuvo uniformidad tecnica a lo largo de todo el repositorio:
- **TypeScript Strict:** Uso sistematico del tipado estatico en todo el proyecto. Todas las respuestas de red estan modeladas con interfaces precisas (`Achievement`, `UserAchievement`), previniendo errores de "undefined".
- **Intercepcion Centralizada:** Para no escribir el token JWT a mano en cada llamada al backend, toda la aplicacion utiliza la misma instancia de Axios (`axiosClient`) que intercepta y adjunta automaticamente el token `Bearer` a las cabeceras de peticion, asegurando una logica de red coherente y aprueba de olvidos.
