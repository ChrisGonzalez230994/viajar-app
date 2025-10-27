# 🌍 Viajar App

Aplicación web completa para la planificación y exploración de viajes, permitiendo a los usuarios descubrir destinos turísticos, realizar reservas y compartir experiencias a través de reseñas.

## 🏗️ Arquitectura del Proyecto

### Frontend (Angular)
- Framework: Angular 20.3.7
- Componentes: Login, Registro, Home, Navbar
- Modelos: Usuario, Destino, Reserva, Reseña

### Backend (Express + MongoDB)
- API RESTful con Express.js
- Base de datos: MongoDB con Mongoose
- Autenticación: JWT (JSON Web Tokens)
- Documentación completa en `/api/README.md`

## 📋 Características Principales

### Para Usuarios
- ✅ Registro e inicio de sesión
- ✅ Búsqueda y filtrado de destinos
- ✅ Información detallada de destinos (descripción, ubicación, actividades, precios)
- ✅ Sistema de reservas con verificación de disponibilidad
- ✅ Calificaciones y reseñas de destinos visitados
- ✅ Gestión de reservas personales
- ✅ Visualización de reseñas propias

### Para Administradores
- ✅ Gestión completa de destinos (CRUD)
- ✅ Confirmación y gestión de reservas
- ✅ Control de usuarios
- ✅ Verificación de reseñas
- ✅ Panel de administración

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Instalación Backend (API)

```bash
# Navegar a la carpeta de la API
cd api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MongoDB

# Poblar base de datos con datos de ejemplo (opcional)
node seeds/seedDatabase.js

# Iniciar servidor en modo desarrollo
npm run dev

# O en modo producción
docker build -t viajar-api
docker run -d -p 3000:3000 viajar-api:latest
```

La API estará disponible en `http://localhost:3000`

### Instalación Frontend (Angular)

```bash
# En la raíz del proyecto
npm install

# Iniciar servidor de desarrollo
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 📚 Documentación

### API
- **Documentación completa**: `/api/README.md`
- **Estructura del proyecto**: `/api/ESTRUCTURA.md`
- **Colección Postman**: `/api/postman-collection.json`

### Modelos de Datos

**Usuario**
- username, password, nombre, apellido, email
- nacionalidad, fechaNacimiento
- rol (admin/user)

**Destino**
- nombre, ciudad, país, descripción
- imágenes, precio, ubicación (lat/lng)
- actividades, disponibilidad
- calificación promedio, total reseñas

**Reserva**
- usuario, destino
- fechaInicio, fechaFin
- estado (pendiente/confirmada/cancelada/completada)
- numeroPersonas, precioTotal

**Reseña**
- usuario, destino
- calificación (1-5), comentario
- verificada, likes, reportada

## 🔌 Endpoints Principales de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Destinos
- `GET /api/destinos` - Listar destinos
- `GET /api/destinos/:id` - Obtener destino específico
- `POST /api/destinos` - Crear destino (admin)
- `PUT /api/destinos/:id` - Actualizar destino (admin)
- `DELETE /api/destinos/:id` - Eliminar destino (admin)

### Reservas
- `GET /api/reservas/mis-reservas` - Mis reservas
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/:id/estado` - Actualizar estado
- `GET /api/reservas/disponibilidad/:destinoId` - Verificar disponibilidad

### Reseñas
- `GET /api/reseñas/destino/:destinoId` - Reseñas de un destino
- `POST /api/reseñas` - Crear reseña
- `PUT /api/reseñas/:id` - Actualizar reseña
- `POST /api/reseñas/:id/like` - Dar like

## 👥 Usuarios de Prueba

Después de ejecutar el seed de la base de datos:

| Email | Password | Rol |
|-------|----------|-----|
| admin@viajar.com | admin123 | Administrador |
| juan@example.com | user123 | Usuario |
| maria@example.com | user123 | Usuario |

## 🛠️ Tecnologías Utilizadas

### Frontend
- Angular 20.3.7
- TypeScript
- SCSS
- RxJS

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación basada en JWT
- Validación de datos en backend
- Middlewares de autenticación y autorización
- Protección de rutas sensibles

## 📝 Requisitos Funcionales Implementados

✅ RF1: Registro de usuarios  
✅ RF2: Inicio y cierre de sesión  
✅ RF3: Gestión de usuarios por admin  
✅ RF4: Búsqueda de destinos  
✅ RF5: Información detallada de destinos  
✅ RF7: Realizar reservas  
✅ RF8: Admin gestiona reservas  
✅ RF9: Notificación de estados de reserva  
✅ RF10: Comentarios y calificaciones  
✅ RF11: Visualización de reseñas  
✅ RF12: Admin gestiona destinos  
✅ RF13: Actualización de información  

## 🎯 Próximas Características

- [ ] Sistema de notificaciones en tiempo real
- [ ] Upload de imágenes
- [ ] Integración con mapas interactivos
- [ ] Sistema de pagos
- [ ] Favoritos
- [ ] Recomendaciones personalizadas
- [ ] Chat en tiempo real
- [ ] App móvil

## 📄 Licencia

Proyecto educativo - 2025

## 👨‍💻 Autor

ChrisGonzalez230994
LucasULS
Xavier Galarreta
---

## Angular CLI (Referencia Original)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.
