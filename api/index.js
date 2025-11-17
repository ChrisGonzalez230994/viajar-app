//requires
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');
const path = require('path');
const qdrantConnection = require('./config/qdrant');

require('dotenv').config();

//instances
const app = express();

// Configurar trust proxy para nginx SSL (IMPORTANTE)
app.set('trust proxy', true);

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

//express config
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes base64 o datos grandes
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

//routes
app.use('/api/auth', require('./routes/users.js'));
app.use('/api/destinos', require('./routes/destinos.js'));
app.use('/api/reservas', require('./routes/reservas.js'));
app.use('/api/reseñas', require('./routes/reseñas.js'));
app.use('/api/search', require('./routes/search.js'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Viajar-App funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint no encontrado',
  });
});

module.exports = app;

//listener
app.listen(process.env.API_PORT, () => {
  console.log('API server listening on port ' + process.env.API_PORT);
});

//Mongo Connection
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri =
  'mongodb://' +
  mongoUserName +
  ':' +
  mongoPassword +
  '@' +
  mongoHost +
  ':' +
  mongoPort +
  '/' +
  mongoDatabase +
  '?authSource=admin';

console.log(uri);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
};

mongoose.connect(uri, options).then(
  () => {
    console.log('\n');
    console.log('*******************************'.green);
    console.log('✔ Mongo Successfully Connected!'.green);
    console.log('*******************************'.green);
    console.log('\n');
  },
  (err) => {
    console.log('\n');
    console.log('*******************************'.red);
    console.log('    Mongo Connection Failed    '.red);
    console.log('*******************************'.red);
    console.log('\n');
    console.log(err);
  }
);
