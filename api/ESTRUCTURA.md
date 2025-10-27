# Estructura de la API - Viajar App

## 📁 Estructura de Directorios

```
api/
├── models/              # Modelos de MongoDB/Mongoose
│   ├── user.js         # Modelo de Usuario
│   ├── destino.js      # Modelo de Destino
│   ├── reserva.js      # Modelo de Reserva
│   └── reseña.js       # Modelo de Reseña
│
├── routes/              # Rutas/Endpoints de la API
│   ├── users.js        # Rutas de autenticación y usuarios
│   ├── destinos.js     # Rutas de destinos turísticos
│   ├── reservas.js     # Rutas de reservas
│   └── reseñas.js      # Rutas de reseñas y calificaciones
│
├── middlewares/         # Middlewares personalizados
│   └── authentication.js  # Middleware de autenticación JWT
│
├── seeds/               # Scripts para poblar la BD
│   └── seedDatabase.js  # Script de seed con datos de ejemplo
│
├── utils/               # Utilidades
│   └── logger.js        # Logger para registros
│
├── index.js             # Punto de entrada de la aplicación
├── server.js            # Configuración del servidor
├── package.json         # Dependencias y scripts
├── .env.example         # Variables de entorno de ejemplo
├── .env                 # Variables de entorno (no subir a git)
├── Dockerfile           # Dockerfile para containerización
├── README.md            # Documentación completa
└── postman-collection.json  # Colección Postman para testing
```

## 🔗 Relaciones entre Modelos

```
Usuario (1:N) ──→ Reservas
Usuario (1:N) ──→ Reseñas

Destino (1:N) ──→ Reservas
Destino (1:N) ──→ Reseñas

Reserva (N:1) ──→ Usuario
Reserva (N:1) ──→ Destino

Reseña (N:1) ──→ Usuario
Reseña (N:1) ──→ Destino
Reseña (N:1) ──→ Reserva (opcional)
```

## 🎯 Requisitos Funcionales Implementados

### Usuario (RF1, RF2, RF3)
- ✅ Registro de usuarios con validación
- ✅ Login con JWT
- ✅ Roles (admin/user)
- ✅ Gestión de usuarios por admin

### Destinos (RF4, RF5, RF12, RF13)
- ✅ Búsqueda por nombre, ciudad, país
- ✅ Filtros por precio y calificación
- ✅ Información detallada (descripción, ubicación, fotos, actividades)
- ✅ CRUD completo para admin
- ✅ Sistema de disponibilidad

### Reservas (RF7, RF8, RF9)
- ✅ Crear reservas
- ✅ Verificar disponibilidad
- ✅ Gestión de estados (pendiente, confirmada, cancelada, completada)
- ✅ Admin puede confirmar/modificar/cancelar
- ✅ Cálculo automático de precio total

### Reseñas (RF10, RF11)
- ✅ Crear reseñas con calificación (1-5) y comentario
- ✅ Solo usuarios con reservas confirmadas pueden reseñar
- ✅ Actualización automática de calificación promedio del destino
- ✅ Sistema de likes
- ✅ Sistema de reportes
- ✅ Verificación por admin

## 🔐 Sistema de Autenticación

### JWT Token
- Se genera en el login
- Se envía en el header `token`
- Contiene: userId, username, email, rol
- Expira según configuración

### Middlewares
- `checkAuth`: Verifica token válido
- `checkAdmin`: Verifica rol de administrador

## 📊 Respuestas Estándar

### Éxito
```json
{
  "status": "success",
  "data": { ... },
  "message": "Mensaje opcional",
  "pagination": { 
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error
```json
{
  "status": "error",
  "error": "Descripción del error",
  "code": 1
}
```

## 🚀 Cómo Empezar

### 1. Instalar dependencias
```bash
cd api
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Iniciar MongoDB
Asegúrate de tener MongoDB corriendo en tu máquina o usa MongoDB Atlas

### 4. Poblar la base de datos (opcional)
```bash
node seeds/seedDatabase.js
```

### 5. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📝 Usuarios de Prueba (después del seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@viajar.com | admin123 | admin |
| juan@example.com | user123 | user |
| maria@example.com | user123 | user |

## 🧪 Testing

### Con Postman/Thunder Client
1. Importa `postman-collection.json`
2. Haz login para obtener el token JWT
3. Copia el token en la variable `jwt_token`
4. Prueba los diferentes endpoints

### Endpoints de Prueba
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@viajar.com","password":"admin123"}'

# Listar destinos
curl http://localhost:3000/api/destinos
```

## 📦 Dependencias Principales

- **express**: Framework web
- **mongoose**: ODM para MongoDB
- **jsonwebtoken**: Autenticación JWT
- **bcrypt**: Encriptación de contraseñas
- **cors**: CORS middleware
- **morgan**: Logger HTTP
- **dotenv**: Variables de entorno
- **nodemailer**: Envío de emails
- **colors**: Colores en consola

## 🔄 Próximas Mejoras

- [ ] Sistema de notificaciones en tiempo real
- [ ] Upload de imágenes con Multer/Cloudinary
- [ ] Sistema de favoritos
- [ ] Historial de búsquedas
- [ ] Recomendaciones personalizadas
- [ ] Integración con APIs de mapas
- [ ] Sistema de pagos
- [ ] Chat en tiempo real
- [ ] Métricas y analytics
- [ ] Tests automatizados

## 📄 Licencia

Este proyecto es parte de una aplicación educativa.
