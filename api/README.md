# API Viajar-App

API RESTful para la aplicación de planificación y exploración de viajes.

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- bcrypt para encriptación de contraseñas

## Modelos de Datos

### Usuario
- **username**: Nombre de usuario único
- **password**: Contraseña encriptada
- **nombre**: Nombre del usuario
- **apellido**: Apellido del usuario
- **email**: Email único
- **nacionalidad**: País de origen
- **fechaNacimiento**: Fecha de nacimiento
- **rol**: "admin" o "user"

### Destino
- **nombre**: Nombre del destino turístico
- **ciudad**: Ciudad donde se encuentra
- **pais**: País
- **descripcion**: Descripción detallada
- **imagenes**: Array de URLs de imágenes
- **imagenPrincipal**: URL de imagen principal
- **precio**: Precio por persona por día
- **ubicacion**: Objeto con latitud, longitud y dirección
- **actividades**: Array de actividades disponibles
- **disponibilidad**: Booleano
- **calificacionPromedio**: Promedio de calificaciones (0-5)
- **totalReseñas**: Cantidad total de reseñas
- **capacidadMaxima**: Número máximo de personas

### Reserva
- **usuario**: Referencia al usuario
- **destino**: Referencia al destino
- **fechaInicio**: Fecha de inicio de la reserva
- **fechaFin**: Fecha de fin de la reserva
- **estado**: "pendiente", "confirmada", "cancelada", "completada"
- **numeroPersonas**: Cantidad de personas
- **precioTotal**: Precio total calculado
- **notas**: Notas adicionales
- **motivoCancelacion**: Motivo si fue cancelada
- **fechaCancelacion**: Fecha de cancelación
- **fechaConfirmacion**: Fecha de confirmación

### Reseña
- **usuario**: Referencia al usuario
- **destino**: Referencia al destino
- **calificacion**: Calificación de 1 a 5
- **comentario**: Texto del comentario
- **imagenes**: Array de URLs de imágenes
- **reserva**: Referencia a la reserva relacionada
- **verificada**: Booleano indicando si fue verificada por admin
- **likes**: Cantidad de likes
- **reportada**: Booleano si fue reportada
- **motivoReporte**: Motivo del reporte

## Endpoints

### Autenticación (Usuario)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- Ver más en `/api/routes/users.js`

### Destinos
- `GET /api/destinos` - Listar destinos con filtros
  - Query params: search, ciudad, pais, precioMin, precioMax, calificacionMin, limit, page, sortBy, sortOrder
- `GET /api/destinos/:id` - Obtener destino específico con reseñas
- `GET /api/destinos/destacados/top` - Obtener destinos mejor calificados
- `POST /api/destinos` - Crear destino (admin) 🔒
- `PUT /api/destinos/:id` - Actualizar destino (admin) 🔒
- `DELETE /api/destinos/:id` - Desactivar destino (admin) 🔒

### Reservas
- `GET /api/reservas/mis-reservas` - Obtener reservas del usuario 🔒
- `GET /api/reservas` - Listar todas las reservas (admin) 🔒
- `GET /api/reservas/:id` - Obtener reserva específica 🔒
- `GET /api/reservas/disponibilidad/:destinoId` - Verificar disponibilidad
  - Query params: fechaInicio, fechaFin
- `POST /api/reservas` - Crear nueva reserva 🔒
- `PUT /api/reservas/:id/estado` - Actualizar estado de reserva 🔒
- `DELETE /api/reservas/:id` - Cancelar reserva 🔒

### Reseñas
- `GET /api/reseñas/destino/:destinoId` - Obtener reseñas de un destino
- `GET /api/reseñas/mis-reseñas` - Obtener reseñas del usuario 🔒
- `GET /api/reseñas/:id` - Obtener reseña específica
- `POST /api/reseñas` - Crear nueva reseña 🔒
- `PUT /api/reseñas/:id` - Actualizar reseña 🔒
- `DELETE /api/reseñas/:id` - Eliminar reseña 🔒
- `POST /api/reseñas/:id/reportar` - Reportar reseña 🔒
- `PUT /api/reseñas/:id/verificar` - Verificar reseña (admin) 🔒
- `POST /api/reseñas/:id/like` - Dar like a reseña 🔒

🔒 = Requiere autenticación (token JWT en header)

## Autenticación

Para las rutas protegidas, incluir en los headers:
```
token: <JWT_TOKEN>
```

## Variables de Entorno

Crear archivo `.env` en la carpeta `/api` con:

```env
# API
API_PORT=3000

# MongoDB
MONGO_USERNAME=usuario
MONGO_PASSWORD=contraseña
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DATABASE=viajar_app

# JWT
TOKEN_SECRET=tu_secreto_jwt_muy_seguro
```

## Instalación

```bash
cd api
npm install
```

## Ejecución

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Respuestas de la API

### Exitosa
```json
{
  "status": "success",
  "data": { ... },
  "message": "Mensaje opcional"
}
```

### Error
```json
{
  "status": "error",
  "error": "Descripción del error"
}
```

## Características Implementadas

✅ Sistema de autenticación con JWT  
✅ Roles de usuario (admin/user)  
✅ CRUD completo para Destinos  
✅ Sistema de Reservas con verificación de disponibilidad  
✅ Sistema de Reseñas con calificaciones  
✅ Actualización automática de calificación promedio  
✅ Búsqueda y filtrado de destinos  
✅ Paginación en listados  
✅ Validaciones de datos  
✅ Restricciones de permisos  
✅ Gestión de estados de reservas  
✅ Sistema de reportes para reseñas  

## Requisitos Funcionales Implementados

- **RF1**: Registro de usuarios ✅
- **RF2**: Inicio y cierre de sesión ✅
- **RF3**: Gestión de usuarios por admin ✅
- **RF4**: Búsqueda de destinos ✅
- **RF5**: Información detallada de destinos ✅
- **RF7**: Realizar reservas ✅
- **RF8**: Admin confirma/modifica/cancela reservas ✅
- **RF9**: Notificación de estados (estructura lista) ✅
- **RF10**: Comentarios y calificaciones ✅
- **RF11**: Mostrar calificaciones y reseñas ✅
- **RF12**: Admin gestiona destinos ✅
- **RF13**: Actualización de información ✅

## Próximos Pasos

- Implementar sistema de notificaciones por email
- Agregar upload de imágenes
- Implementar sistema de favoritos
- Agregar filtros geográficos avanzados
- Implementar caché para destinos populares
- Agregar logs de auditoría
