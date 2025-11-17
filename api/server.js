const express = require('express');
const cors = require('cors');
const path = require('path');
const blogRoutes = require('./routes/blog');
const destinosRoutes = require('./routes/destinos');
const reservasRoutes = require('./routes/reservas');
const reseñasRoutes = require('./routes/reseñas');
const usersRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const qdrantConnection = require('./config/qdrant');

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Qdrant al iniciar el servidor
async function initializeVectorDB() {
  try {
    console.log('🔄 Inicializando Qdrant...');
    await qdrantConnection.initialize();
    const isHealthy = await qdrantConnection.healthCheck();
    if (isHealthy) {
      console.log('✅ Qdrant conectado y listo');
    } else {
      console.warn('⚠️  Qdrant no está disponible. Búsqueda semántica deshabilitada.');
    }
  } catch (error) {
    console.error('❌ Error inicializando Qdrant:', error.message);
    console.warn('⚠️  Continuando sin búsqueda semántica...');
  }
}

initializeVectorDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/blog', blogRoutes);
app.use('/api/destinos', destinosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/reseñas', reseñasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

module.exports = app;
