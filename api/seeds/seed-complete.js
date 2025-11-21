/**
 * Script COMPLETO para poblar la base de datos con datos de ejemplo
 * Ejecutar con: node api/seeds/seed-complete.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Importar modelos
const User = require('../models/user.js');
const Destino = require('../models/destino.js');
const Reserva = require('../models/reserva.js');
const Reseña = require('../models/reseña.js');

// Importar repositorio vectorial
const vectorRepo = require('../repositories/vector.repository.js');

// Conexión a MongoDB
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

const uri =
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

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
};

// ==================== DATOS DE EJEMPLO ====================

// USUARIOS
const usuariosData = [
  {
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@viajar.com',
    nacionalidad: 'Argentina',
    fechaNacimiento: new Date('1985-01-15'),
    rol: 'admin',
    confirmed: true,
  },
  {
    username: 'juanperez',
    password: 'user123',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    nacionalidad: 'Argentina',
    fechaNacimiento: new Date('1990-03-20'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'mariagonzalez',
    password: 'user123',
    nombre: 'María',
    apellido: 'González',
    email: 'maria@example.com',
    nacionalidad: 'España',
    fechaNacimiento: new Date('1992-07-10'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'carlosrodriguez',
    password: 'user123',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos@example.com',
    nacionalidad: 'México',
    fechaNacimiento: new Date('1988-11-05'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'analopez',
    password: 'user123',
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana@example.com',
    nacionalidad: 'Colombia',
    fechaNacimiento: new Date('1995-09-18'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'pedromartinez',
    password: 'user123',
    nombre: 'Pedro',
    apellido: 'Martínez',
    email: 'pedro@example.com',
    nacionalidad: 'Chile',
    fechaNacimiento: new Date('1987-05-22'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'laurafernandez',
    password: 'user123',
    nombre: 'Laura',
    apellido: 'Fernández',
    email: 'laura@example.com',
    nacionalidad: 'Uruguay',
    fechaNacimiento: new Date('1993-04-12'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'diegosilva',
    password: 'user123',
    nombre: 'Diego',
    apellido: 'Silva',
    email: 'diego@example.com',
    nacionalidad: 'Brasil',
    fechaNacimiento: new Date('1989-08-30'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'sofiatorres',
    password: 'user123',
    nombre: 'Sofía',
    apellido: 'Torres',
    email: 'sofia@example.com',
    nacionalidad: 'Perú',
    fechaNacimiento: new Date('1994-11-25'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'miguelangel',
    password: 'user123',
    nombre: 'Miguel Ángel',
    apellido: 'Ramírez',
    email: 'miguel@example.com',
    nacionalidad: 'Venezuela',
    fechaNacimiento: new Date('1991-02-14'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'valentinacas',
    password: 'user123',
    nombre: 'Valentina',
    apellido: 'Castro',
    email: 'valentina@example.com',
    nacionalidad: 'Ecuador',
    fechaNacimiento: new Date('1996-06-08'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'andresmora',
    password: 'user123',
    nombre: 'Andrés',
    apellido: 'Mora',
    email: 'andres@example.com',
    nacionalidad: 'Costa Rica',
    fechaNacimiento: new Date('1986-12-20'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'isabelortiz',
    password: 'user123',
    nombre: 'Isabel',
    apellido: 'Ortiz',
    email: 'isabel@example.com',
    nacionalidad: 'Panamá',
    fechaNacimiento: new Date('1997-03-17'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'robertoherrera',
    password: 'user123',
    nombre: 'Roberto',
    apellido: 'Herrera',
    email: 'roberto@example.com',
    nacionalidad: 'Bolivia',
    fechaNacimiento: new Date('1984-09-05'),
    rol: 'user',
    confirmed: true,
  },
  {
    username: 'camilavargas',
    password: 'user123',
    nombre: 'Camila',
    apellido: 'Vargas',
    email: 'camila@example.com',
    nacionalidad: 'Paraguay',
    fechaNacimiento: new Date('1998-01-22'),
    rol: 'user',
    confirmed: true,
  },
];

// DESTINOS - 40 destinos internacionales variados
const destinosData = [
  {
    nombre: 'Santorini',
    ciudad: 'Oia',
    pais: 'Grecia',
    descripcion:
      'Descubre el romántico pueblo blanco de Santorini, con sus espectaculares atardeceres, playas de arena volcánica y deliciosa gastronomía griega. Un destino perfecto para parejas y viajeros en busca de paraíso mediterráneo.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800',
    ],
    precio: 890,
    ubicacion: {
      latitud: 36.4618,
      longitud: 25.3753,
      direccion: 'Oia, Santorini, Islas Cícladas',
    },
    tipoViaje: ['romantico', 'playa', 'gastronomico'],
    actividades: [
      'Vistas al atardecer',
      'Playas únicas',
      'Gastronomía griega',
      'Pueblos pintorescos',
    ],
    disponibilidad: true,
    capacidadMaxima: 50,
  },
  {
    nombre: 'Machu Picchu',
    ciudad: 'Cusco',
    pais: 'Perú',
    descripcion:
      'Ciudad inca del siglo XV ubicada en lo alto de los Andes peruanos. Patrimonio de la Humanidad y una de las Siete Maravillas del Mundo Moderno. Un destino místico e histórico imprescindible para los amantes de la aventura y la cultura.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
      'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800',
    ],
    precio: 780,
    ubicacion: {
      latitud: -13.1631,
      longitud: -72.545,
      direccion: 'Machu Picchu, Cusco',
    },
    tipoViaje: ['aventura', 'historia'],
    actividades: ['Senderismo', 'Fotografía', 'Visitas guiadas', 'Tours guiados'],
    disponibilidad: true,
    capacidadMaxima: 35,
  },
  {
    nombre: 'Patagonia Argentina',
    ciudad: 'El Calafate',
    pais: 'Argentina',
    descripcion:
      'Explora los majestuosos glaciares de la Patagonia, con el imponente Perito Moreno como protagonista. Paisajes de montañas, lagos turquesa y fauna silvestre única. Una experiencia de aventura inolvidable en el fin del mundo.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?w=800',
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    ],
    precio: 650,
    ubicacion: {
      latitud: -50.3395,
      longitud: -72.2631,
      direccion: 'El Calafate, Santa Cruz',
    },
    tipoViaje: ['aventura', 'naturaleza'],
    actividades: ['Trekking', 'Avistamiento de fauna', 'Kayak', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Tokyo Moderno',
    ciudad: 'Tokyo',
    pais: 'Japón',
    descripcion:
      'Sumérgete en la fascinante mezcla de tradición y modernidad de Tokyo. Desde templos antiguos hasta rascacielos futuristas, gastronomía de clase mundial y cultura pop vibrante. Una experiencia única en la capital japonesa.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      'https://images.unsplash.com/photo-1549693578-d683be217e58?w=800',
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800',
    ],
    precio: 1200,
    ubicacion: {
      latitud: 35.6762,
      longitud: 139.6503,
      direccion: 'Shibuya, Tokyo',
    },
    tipoViaje: ['gastronomico', 'ciudad'],
    actividades: ['Gastronomía', 'Visitas culturales', 'Compras', 'Vida nocturna'],
    disponibilidad: true,
    capacidadMaxima: 60,
  },
  {
    nombre: 'Islas Maldivas',
    ciudad: 'Malé',
    pais: 'Maldivas',
    descripcion:
      'Paraíso tropical con playas de arena blanca, aguas cristalinas y arrecifes de coral. Perfectas para buceo, snorkel y relajación absoluta. Un destino de ensueño para lunas de miel y escapadas románticas.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    ],
    precio: 1500,
    ubicacion: {
      latitud: 4.1755,
      longitud: 73.5093,
      direccion: 'Atolón de Malé Norte',
    },
    tipoViaje: ['romantico', 'playa'],
    actividades: ['Buceo', 'Snorkel', 'Spa y relax', 'Playas'],
    disponibilidad: true,
    capacidadMaxima: 30,
  },
  {
    nombre: 'Venecia Romántica',
    ciudad: 'Venecia',
    pais: 'Italia',
    descripcion:
      'La ciudad de los canales te espera con su arquitectura gótica, góndolas románticas y riqueza cultural. Pasea por sus puentes, visita la Plaza San Marcos y disfruta de la auténtica cocina italiana.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
      'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
    ],
    precio: 820,
    ubicacion: {
      latitud: 45.4408,
      longitud: 12.3155,
      direccion: 'Venecia, Véneto',
    },
    tipoViaje: ['romantico', 'gastronomico'],
    actividades: ['Paseos en góndola', 'Visitas culturales', 'Gastronomía', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
  {
    nombre: 'Safari en Kenia',
    ciudad: 'Nairobi',
    pais: 'Kenia',
    descripcion:
      'Vive la emoción de un auténtico safari africano. Observa leones, elefantes, jirafas y más en su hábitat natural. Explora el Masai Mara y experimenta la cultura masai en este viaje inolvidable.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    ],
    precio: 1100,
    ubicacion: {
      latitud: -1.2921,
      longitud: 36.8219,
      direccion: 'Parque Nacional Masai Mara',
    },
    tipoViaje: ['aventura', 'naturaleza', 'fotografia'],
    actividades: ['Safari', 'Avistamiento de fauna', 'Fotografía', 'Visitas culturales'],
    disponibilidad: true,
    capacidadMaxima: 25,
  },
  {
    nombre: 'Cartagena Colonial',
    ciudad: 'Cartagena',
    pais: 'Colombia',
    descripcion:
      'Ciudad colonial caribeña con murallas históricas, calles empedradas y arquitectura colorida. Combina historia, cultura, playas y gastronomía en un solo destino vibrante y lleno de vida.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800',
    imagenes: ['https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800'],
    precio: 450,
    ubicacion: {
      latitud: 10.391,
      longitud: -75.4794,
      direccion: 'Centro Histórico, Cartagena',
    },
    tipoViaje: ['playa', 'gastronomico', 'ciudad'],
    actividades: ['Tours guiados', 'Playas', 'Gastronomía', 'Vida nocturna'],
    disponibilidad: true,
    capacidadMaxima: 55,
  },
  {
    nombre: 'París Ciudad Luz',
    ciudad: 'París',
    pais: 'Francia',
    descripcion:
      'La ciudad del amor te espera con la Torre Eiffel, el Louvre, Notre Dame y calles llenas de encanto. Gastronomía de clase mundial y arquitectura impresionante.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
    ],
    precio: 950,
    ubicacion: { latitud: 48.8566, longitud: 2.3522, direccion: 'Torre Eiffel, París' },
    tipoViaje: ['romantico', 'gastronomico', 'ciudad'],
    actividades: ['Museos', 'Gastronomía', 'Paseos', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 50,
  },
  {
    nombre: 'Dubái Futurista',
    ciudad: 'Dubái',
    pais: 'Emiratos Árabes',
    descripcion:
      'Ciudad del futuro con rascacielos impresionantes, playas de lujo, desierto y compras de primer nivel. Combina tradición árabe con modernidad extrema.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    imagenes: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
    ],
    precio: 1350,
    ubicacion: { latitud: 25.2048, longitud: 55.2708, direccion: 'Burj Khalifa, Dubái' },
    tipoViaje: ['ciudad', 'playa'],
    actividades: ['Compras', 'Desierto', 'Playas', 'Arquitectura'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
  {
    nombre: 'Islandia Mágica',
    ciudad: 'Reikiavik',
    pais: 'Islandia',
    descripcion:
      'Tierra de hielo y fuego con auroras boreales, géiseres, cascadas espectaculares y paisajes de otro mundo. Perfecto para aventureros.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800',
    imagenes: ['https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800'],
    precio: 1100,
    ubicacion: { latitud: 64.1466, longitud: -21.9426, direccion: 'Reikiavik' },
    tipoViaje: ['aventura', 'naturaleza', 'fotografia'],
    actividades: ['Auroras boreales', 'Senderismo', 'Aguas termales', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 30,
  },
  {
    nombre: 'Nueva York Vibrante',
    ciudad: 'Nueva York',
    pais: 'Estados Unidos',
    descripcion:
      'La ciudad que nunca duerme. Rascacielos icónicos, Broadway, Central Park, museos de clase mundial y diversidad cultural única.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    imagenes: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'],
    precio: 1050,
    ubicacion: { latitud: 40.7128, longitud: -74.006, direccion: 'Times Square, Manhattan' },
    tipoViaje: ['ciudad', 'gastronomico'],
    actividades: ['Museos', 'Broadway', 'Compras', 'Gastronomía'],
    disponibilidad: true,
    capacidadMaxima: 60,
  },
  {
    nombre: 'Bali Espiritual',
    ciudad: 'Ubud',
    pais: 'Indonesia',
    descripcion:
      'Isla paradisíaca con templos ancestrales, arrozales en terrazas, playas de ensueño y cultura espiritual profunda. Perfecto para relajación y conexión.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    imagenes: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'],
    precio: 720,
    ubicacion: { latitud: -8.5069, longitud: 115.2625, direccion: 'Ubud, Bali' },
    tipoViaje: ['playa', 'relax', 'naturaleza'],
    actividades: ['Templos', 'Yoga', 'Playas', 'Arrozales'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Barcelona Modernista',
    ciudad: 'Barcelona',
    pais: 'España',
    descripcion:
      'Ciudad mediterránea con arquitectura de Gaudí, playas urbanas, gastronomía catalana y vida nocturna vibrante. Arte y cultura en cada esquina.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800',
    imagenes: ['https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800'],
    precio: 780,
    ubicacion: { latitud: 41.4036, longitud: 2.1744, direccion: 'Sagrada Familia, Barcelona' },
    tipoViaje: ['ciudad', 'playa', 'gastronomico'],
    actividades: ['Arquitectura', 'Playas', 'Gastronomía', 'Museos'],
    disponibilidad: true,
    capacidadMaxima: 55,
  },
  {
    nombre: 'Praga Medieval',
    ciudad: 'Praga',
    pais: 'República Checa',
    descripcion:
      'Ciudad de cuento con castillos, puentes históricos y arquitectura gótica. Cerveza de calidad mundial y precios accesibles.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
    imagenes: ['https://images.unsplash.com/photo-1541849546-216549ae216d?w=800'],
    precio: 620,
    ubicacion: { latitud: 50.0755, longitud: 14.4378, direccion: 'Puente de Carlos, Praga' },
    tipoViaje: ['historia', 'ciudad'],
    actividades: ['Castillos', 'Tours guiados', 'Gastronomía', 'Vida nocturna'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
  {
    nombre: 'Phuket Tropical',
    ciudad: 'Phuket',
    pais: 'Tailandia',
    descripcion:
      'Isla tailandesa con playas paradisíacas, templos budistas, vida nocturna animada y gastronomía exótica. Relax y aventura en equilibrio perfecto.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
    imagenes: ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'],
    precio: 680,
    ubicacion: { latitud: 7.8804, longitud: 98.3923, direccion: 'Patong Beach, Phuket' },
    tipoViaje: ['playa', 'aventura'],
    actividades: ['Buceo', 'Playas', 'Templos', 'Vida nocturna'],
    disponibilidad: true,
    capacidadMaxima: 50,
  },
  {
    nombre: 'Ámsterdam de Canales',
    ciudad: 'Ámsterdam',
    pais: 'Países Bajos',
    descripcion:
      'Ciudad de canales pintorescos, museos de arte de clase mundial, arquitectura única y cultura liberal. Ideal para recorrer en bicicleta.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    imagenes: ['https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800'],
    precio: 850,
    ubicacion: { latitud: 52.3676, longitud: 4.9041, direccion: 'Centro de Ámsterdam' },
    tipoViaje: ['ciudad', 'historia'],
    actividades: ['Museos', 'Canales', 'Bicicleta', 'Gastronomía'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Petra Ancestral',
    ciudad: 'Wadi Musa',
    pais: 'Jordania',
    descripcion:
      'Ciudad nabatea tallada en roca rosada. Una de las Siete Maravillas del Mundo Moderno. Historia antigua y paisajes desérticos impresionantes.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800',
    imagenes: ['https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800'],
    precio: 920,
    ubicacion: { latitud: 30.3285, longitud: 35.4444, direccion: 'Petra, Jordania' },
    tipoViaje: ['historia', 'aventura'],
    actividades: ['Tours guiados', 'Senderismo', 'Fotografía', 'Arqueología'],
    disponibilidad: true,
    capacidadMaxima: 35,
  },
  {
    nombre: 'Queenstown Aventura',
    ciudad: 'Queenstown',
    pais: 'Nueva Zelanda',
    descripcion:
      'Capital mundial de la aventura con deportes extremos, paisajes de montaña espectaculares y lagos cristalinos. Naturaleza en estado puro.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800',
    imagenes: ['https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800'],
    precio: 1150,
    ubicacion: { latitud: -45.0312, longitud: 168.6626, direccion: 'Queenstown' },
    tipoViaje: ['aventura', 'naturaleza'],
    actividades: ['Deportes extremos', 'Senderismo', 'Esquí', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 30,
  },
  {
    nombre: 'Estambul Bicontinental',
    ciudad: 'Estambul',
    pais: 'Turquía',
    descripcion:
      'Ciudad única entre Europa y Asia. Mezquitas impresionantes, bazares coloridos, historia milenaria y gastronomía deliciosa.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
    imagenes: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'],
    precio: 650,
    ubicacion: { latitud: 41.0082, longitud: 28.9784, direccion: 'Sultanahmet, Estambul' },
    tipoViaje: ['historia', 'gastronomico', 'ciudad'],
    actividades: ['Mezquitas', 'Bazares', 'Gastronomía', 'Cruceros'],
    disponibilidad: true,
    capacidadMaxima: 50,
  },
  {
    nombre: 'Seúl Tecnológico',
    ciudad: 'Seúl',
    pais: 'Corea del Sur',
    descripcion:
      'Metrópolis futurista que combina tradición ancestral con tecnología de punta. K-pop, palacios históricos y gastronomía única.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
    imagenes: ['https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800'],
    precio: 980,
    ubicacion: { latitud: 37.5665, longitud: 126.978, direccion: 'Gangnam, Seúl' },
    tipoViaje: ['ciudad', 'gastronomico'],
    actividades: ['Tecnología', 'Palacios', 'Compras', 'Gastronomía'],
    disponibilidad: true,
    capacidadMaxima: 55,
  },
  {
    nombre: 'Cinque Terre Colorido',
    ciudad: 'La Spezia',
    pais: 'Italia',
    descripcion:
      'Cinco pueblos coloridos en acantilados sobre el mar. Patrimonio UNESCO con vistas espectaculares, senderismo y gastronomía italiana auténtica.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
    imagenes: ['https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800'],
    precio: 740,
    ubicacion: { latitud: 44.1273, longitud: 9.7239, direccion: 'Cinque Terre' },
    tipoViaje: ['romantico', 'naturaleza'],
    actividades: ['Senderismo', 'Fotografía', 'Gastronomía', 'Playas'],
    disponibilidad: true,
    capacidadMaxima: 35,
  },
  {
    nombre: 'Marrakech Exótico',
    ciudad: 'Marrakech',
    pais: 'Marruecos',
    descripcion:
      'Ciudad imperial con zocos vibrantes, palacios orientales, jardines mágicos y desierto cercano. Experiencia sensorial única.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800',
    imagenes: ['https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800'],
    precio: 590,
    ubicacion: { latitud: 31.6295, longitud: -7.9811, direccion: 'Medina de Marrakech' },
    tipoViaje: ['historia', 'aventura'],
    actividades: ['Zocos', 'Palacios', 'Desierto', 'Gastronomía'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
  {
    nombre: 'Galápagos Único',
    ciudad: 'Puerto Ayora',
    pais: 'Ecuador',
    descripcion:
      'Archipiélago volcánico con fauna única en el mundo. Tortugas gigantes, iguanas marinas y paisajes prehistóricos. Paraíso para naturalistas.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    imagenes: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
    precio: 1420,
    ubicacion: { latitud: -0.7436, longitud: -90.3046, direccion: 'Islas Galápagos' },
    tipoViaje: ['naturaleza', 'aventura'],
    actividades: ['Fauna', 'Snorkel', 'Buceo', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 25,
  },
  {
    nombre: 'Iguazú Imponente',
    ciudad: 'Puerto Iguazú',
    pais: 'Argentina',
    descripcion:
      'Cataratas espectaculares rodeadas de selva subtropical. Una de las Siete Maravillas Naturales del Mundo. Experiencia inolvidable.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    imagenes: ['https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800'],
    precio: 580,
    ubicacion: { latitud: -25.6953, longitud: -54.4367, direccion: 'Cataratas del Iguazú' },
    tipoViaje: ['naturaleza', 'aventura'],
    actividades: ['Cataratas', 'Selva', 'Paseos en lancha', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 50,
  },
  {
    nombre: 'Riviera Maya',
    ciudad: 'Playa del Carmen',
    pais: 'México',
    descripcion:
      'Paraíso caribeño con playas de arena blanca, cenotes místicos, ruinas mayas y arrecifes de coral. Perfecto para todo tipo de viajeros.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800',
    imagenes: ['https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800'],
    precio: 830,
    ubicacion: { latitud: 20.6296, longitud: -87.0739, direccion: 'Playa del Carmen' },
    tipoViaje: ['playa', 'aventura', 'historia'],
    actividades: ['Playas', 'Buceo', 'Cenotes', 'Ruinas mayas'],
    disponibilidad: true,
    capacidadMaxima: 60,
  },
  {
    nombre: 'Fiordos Noruegos',
    ciudad: 'Bergen',
    pais: 'Noruega',
    descripcion:
      'Paisajes de fiordos majestuosos, montañas nevadas y cascadas impresionantes. Naturaleza escandinava en su máximo esplendor.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1530878902700-5ad4f9e4c318?w=800',
    imagenes: ['https://images.unsplash.com/photo-1530878902700-5ad4f9e4c318?w=800'],
    precio: 1250,
    ubicacion: { latitud: 60.3913, longitud: 5.3221, direccion: 'Bergen, Noruega' },
    tipoViaje: ['naturaleza', 'aventura', 'fotografia'],
    actividades: ['Cruceros', 'Senderismo', 'Fotografía', 'Kayak'],
    disponibilidad: true,
    capacidadMaxima: 35,
  },
  {
    nombre: 'Lisboa Encantadora',
    ciudad: 'Lisboa',
    pais: 'Portugal',
    descripcion:
      'Ciudad de siete colinas con tranvías amarillos, azulejos coloridos, fado melancólico y pasteles de nata. Perfecta combinación de tradición y modernidad.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800',
    imagenes: ['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800'],
    precio: 690,
    ubicacion: { latitud: 38.7223, longitud: -9.1393, direccion: 'Barrio de Alfama, Lisboa' },
    tipoViaje: ['ciudad', 'gastronomico'],
    actividades: ['Tranvías', 'Gastronomía', 'Miradores', 'Fado'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
  {
    nombre: 'Gran Cañón',
    ciudad: 'Arizona',
    pais: 'Estados Unidos',
    descripcion:
      'Una de las maravillas naturales más impresionantes del mundo. Cañones profundos, formaciones rocosas espectaculares y atardeceres inolvidables.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800',
    imagenes: ['https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800'],
    precio: 870,
    ubicacion: { latitud: 36.1069, longitud: -112.1129, direccion: 'Gran Cañón, Arizona' },
    tipoViaje: ['naturaleza', 'aventura', 'fotografia'],
    actividades: ['Senderismo', 'Fotografía', 'Rafting', 'Miradores'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Kioto Tradicional',
    ciudad: 'Kioto',
    pais: 'Japón',
    descripcion:
      'Antigua capital imperial con templos zen, jardines de bambú, geishas y ceremonias del té. Japón tradicional en su máxima expresión.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    imagenes: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'],
    precio: 1050,
    ubicacion: { latitud: 35.0116, longitud: 135.7681, direccion: 'Templo Fushimi Inari, Kioto' },
    tipoViaje: ['historia', 'relax'],
    actividades: ['Templos', 'Jardines', 'Gastronomía', 'Ceremonia del té'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Amalfi Costa',
    ciudad: 'Positano',
    pais: 'Italia',
    descripcion:
      'Costa italiana de ensueño con pueblos en acantilados, limones gigantes, playas escondidas y vistas mediterráneas espectaculares.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800',
    imagenes: ['https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800'],
    precio: 1180,
    ubicacion: { latitud: 40.628, longitud: 14.485, direccion: 'Positano, Costa Amalfitana' },
    tipoViaje: ['romantico', 'playa', 'gastronomico'],
    actividades: ['Playas', 'Gastronomía', 'Paseos en barco', 'Fotografía'],
    disponibilidad: true,
    capacidadMaxima: 30,
  },
  {
    nombre: 'Bora Bora Paradisíaco',
    ciudad: 'Vaitape',
    pais: 'Polinesia Francesa',
    descripcion:
      'Isla paradisíaca con bungalows sobre el agua, laguna turquesa cristalina y arrecifes de coral. El destino romántico definitivo.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1589197331516-7c70e3c6f3ee?w=800',
    imagenes: ['https://images.unsplash.com/photo-1589197331516-7c70e3c6f3ee?w=800'],
    precio: 2100,
    ubicacion: { latitud: -16.5004, longitud: -151.7414, direccion: 'Bora Bora' },
    tipoViaje: ['romantico', 'playa', 'relax'],
    actividades: ['Buceo', 'Snorkel', 'Spa', 'Playas'],
    disponibilidad: true,
    capacidadMaxima: 20,
  },
  {
    nombre: 'Salar de Uyuni',
    ciudad: 'Uyuni',
    pais: 'Bolivia',
    descripcion:
      'El desierto de sal más grande del mundo. Paisajes surrealistas, efecto espejo en época de lluvia y cielos estrellados incomparables.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1583509330197-f2ca38e5c8c3?w=800',
    imagenes: ['https://images.unsplash.com/photo-1583509330197-f2ca38e5c8c3?w=800'],
    precio: 620,
    ubicacion: { latitud: -20.3076, longitud: -66.8251, direccion: 'Salar de Uyuni' },
    tipoViaje: ['aventura', 'naturaleza', 'fotografia'],
    actividades: ['Fotografía', 'Tours 4x4', 'Observación estelar', 'Lagunas'],
    disponibilidad: true,
    capacidadMaxima: 35,
  },
  {
    nombre: 'Angkor Wat',
    ciudad: 'Siem Reap',
    pais: 'Camboya',
    descripcion:
      'Complejo de templos más grande del mundo. Ruinas jemeres impresionantes rodeadas de selva. Historia antigua y espiritualidad.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
    imagenes: ['https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'],
    precio: 750,
    ubicacion: { latitud: 13.4125, longitud: 103.8667, direccion: 'Angkor Wat, Siem Reap' },
    tipoViaje: ['historia', 'aventura'],
    actividades: ['Templos', 'Tours guiados', 'Fotografía', 'Bicicleta'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
  {
    nombre: 'Zermatt Alpino',
    ciudad: 'Zermatt',
    pais: 'Suiza',
    descripcion:
      'Pueblo alpino al pie del Matterhorn. Esquí de clase mundial, senderismo de montaña y paisajes suizos de postal. Lujo alpino.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
    imagenes: ['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800'],
    precio: 1580,
    ubicacion: { latitud: 46.0207, longitud: 7.7491, direccion: 'Zermatt' },
    tipoViaje: ['aventura', 'naturaleza'],
    actividades: ['Esquí', 'Senderismo', 'Montañismo', 'Gastronomía'],
    disponibilidad: true,
    capacidadMaxima: 30,
  },
  {
    nombre: 'Río de Janeiro',
    ciudad: 'Río de Janeiro',
    pais: 'Brasil',
    descripcion:
      'Ciudad maravillosa con playas icónicas, Cristo Redentor, Pan de Azúcar y carnaval vibrante. Energía brasileña única.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    imagenes: ['https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800'],
    precio: 760,
    ubicacion: { latitud: -22.9068, longitud: -43.1729, direccion: 'Copacabana, Río' },
    tipoViaje: ['playa', 'ciudad'],
    actividades: ['Playas', 'Cristo Redentor', 'Vida nocturna', 'Samba'],
    disponibilidad: true,
    capacidadMaxima: 55,
  },
  {
    nombre: 'Edimburgo Histórico',
    ciudad: 'Edimburgo',
    pais: 'Escocia',
    descripcion:
      'Capital escocesa con castillo medieval, callejones misteriosos, festivales culturales y whisky de calidad. Historia en cada piedra.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800',
    imagenes: ['https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800'],
    precio: 820,
    ubicacion: { latitud: 55.9533, longitud: -3.1883, direccion: 'Castillo de Edimburgo' },
    tipoViaje: ['historia', 'ciudad'],
    actividades: ['Castillos', 'Tours de whisky', 'Festivales', 'Gastronomía'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Santorini Nocturno',
    ciudad: 'Fira',
    pais: 'Grecia',
    descripcion:
      'Experiencia nocturna en Santorini con cenas románticas, vistas a la caldera iluminada y vida nocturna griega auténtica.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    imagenes: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'],
    precio: 920,
    ubicacion: { latitud: 36.4167, longitud: 25.4323, direccion: 'Fira, Santorini' },
    tipoViaje: ['romantico', 'gastronomico'],
    actividades: ['Cenas románticas', 'Vida nocturna', 'Vinos', 'Vistas'],
    disponibilidad: true,
    capacidadMaxima: 35,
  },
  {
    nombre: 'Yosemite Natural',
    ciudad: 'California',
    pais: 'Estados Unidos',
    descripcion:
      'Parque nacional icónico con cascadas impresionantes, secuoyas gigantes y formaciones rocosas espectaculares. Naturaleza salvaje.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    imagenes: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    precio: 790,
    ubicacion: { latitud: 37.8651, longitud: -119.5383, direccion: 'Valle de Yosemite' },
    tipoViaje: ['naturaleza', 'aventura'],
    actividades: ['Senderismo', 'Escalada', 'Fotografía', 'Camping'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Cracovia Cultural',
    ciudad: 'Cracovia',
    pais: 'Polonia',
    descripcion:
      'Ciudad medieval con plaza del mercado vibrante, castillo de Wawel y cercanía a Auschwitz. Historia europea profunda.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1613415913109-15b493662c73?w=800',
    imagenes: ['https://images.unsplash.com/photo-1613415913109-15b493662c73?w=800'],
    precio: 540,
    ubicacion: { latitud: 50.0647, longitud: 19.945, direccion: 'Plaza del Mercado, Cracovia' },
    tipoViaje: ['historia', 'ciudad'],
    actividades: ['Tours guiados', 'Castillos', 'Gastronomía', 'Museos'],
    disponibilidad: true,
    capacidadMaxima: 45,
  },
];

// ==================== FUNCIÓN PRINCIPAL ====================

async function seedDatabase() {
  try {
    console.log('🚀 Iniciando seed de base de datos...\n');
    console.log('Conectando a MongoDB...');
    await mongoose.connect(uri, options);
    console.log('✓ Conectado a MongoDB\n');

    // Limpiar base de datos
    console.log('🧹 Limpiando base de datos...');
    await User.deleteMany({});
    await Destino.deleteMany({});
    await Reserva.deleteMany({});
    await Reseña.deleteMany({});
    console.log('✓ Base de datos limpia\n');

    // ========== CREAR USUARIOS ==========
    console.log('👥 Creando usuarios...');
    const usuarios = [];
    for (let userData of usuariosData) {
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      const usuario = new User({
        ...userData,
        password: hashedPassword,
      });
      await usuario.save();
      usuarios.push(usuario);
      console.log(
        `  ✓ ${usuario.nombre} ${usuario.apellido} (@${usuario.username}) - ${usuario.rol}`
      );
    }
    console.log(`✓ ${usuarios.length} usuarios creados\n`);

    // ========== CREAR DESTINOS ==========
    console.log('🌍 Creando destinos...');
    const destinos = [];
    for (let destinoData of destinosData) {
      const destino = new Destino(destinoData);
      await destino.save();
      destinos.push(destino);
      console.log(`  ✓ ${destino.nombre}, ${destino.pais} - $${destino.precio}`);
    }
    console.log(`✓ ${destinos.length} destinos creados\n`);

    // ========== INDEXAR DESTINOS EN BASE DE DATOS VECTORIAL ==========
    console.log('🔍 Indexando destinos en base de datos vectorial...');
    let indexadosExitosos = 0;
    let indexadosFallidos = 0;

    for (const destino of destinos) {
      try {
        await vectorRepo.indexDestino(destino);
        indexadosExitosos++;
        console.log(`  ✓ Indexado: ${destino.nombre}`);
      } catch (error) {
        indexadosFallidos++;
        console.log(`  ✗ Error indexando ${destino.nombre}: ${error.message}`);
      }
    }

    console.log(`✓ ${indexadosExitosos} destinos indexados en Qdrant`);
    if (indexadosFallidos > 0) {
      console.log(`⚠️  ${indexadosFallidos} destinos fallaron al indexar`);
    }
    console.log();

    // ========== CREAR RESERVAS ==========
    console.log('📅 Creando reservas...');
    const reservasData = [
      {
        usuario: usuarios[1]._id, // Juan
        destino: destinos[0]._id, // Santorini
        fechaInicio: new Date('2025-12-10'),
        fechaFin: new Date('2025-12-17'),
        numeroPersonas: 2,
        precioTotal: 1780,
        estado: 'completada',
        fechaConfirmacion: new Date('2025-10-15'),
      },
      {
        usuario: usuarios[2]._id, // María
        destino: destinos[1]._id, // Machu Picchu
        fechaInicio: new Date('2025-11-20'),
        fechaFin: new Date('2025-11-25'),
        numeroPersonas: 1,
        precioTotal: 780,
        estado: 'completada',
        fechaConfirmacion: new Date('2025-10-01'),
      },
      {
        usuario: usuarios[3]._id, // Carlos
        destino: destinos[3]._id, // Tokyo
        fechaInicio: new Date('2025-12-01'),
        fechaFin: new Date('2025-12-08'),
        numeroPersonas: 2,
        precioTotal: 2400,
        estado: 'confirmada',
        fechaConfirmacion: new Date('2025-11-01'),
      },
      {
        usuario: usuarios[4]._id, // Ana
        destino: destinos[2]._id, // Patagonia
        fechaInicio: new Date('2025-11-15'),
        fechaFin: new Date('2025-11-20'),
        numeroPersonas: 3,
        precioTotal: 1950,
        estado: 'completada',
        fechaConfirmacion: new Date('2025-10-10'),
      },
      {
        usuario: usuarios[5]._id, // Pedro
        destino: destinos[5]._id, // Venecia
        fechaInicio: new Date('2026-01-10'),
        fechaFin: new Date('2026-01-15'),
        numeroPersonas: 2,
        precioTotal: 1640,
        estado: 'pendiente',
      },
      {
        usuario: usuarios[1]._id, // Juan
        destino: destinos[7]._id, // Cartagena
        fechaInicio: new Date('2025-10-20'),
        fechaFin: new Date('2025-10-25'),
        numeroPersonas: 2,
        precioTotal: 900,
        estado: 'completada',
        fechaConfirmacion: new Date('2025-09-15'),
      },
    ];

    const reservas = [];
    for (let reservaData of reservasData) {
      const reserva = new Reserva(reservaData);
      await reserva.save();
      reservas.push(reserva);
      const usuario = usuarios.find((u) => u._id.equals(reserva.usuario));
      const destino = destinos.find((d) => d._id.equals(reserva.destino));
      console.log(`  ✓ ${usuario.nombre} → ${destino.nombre} (${reserva.estado})`);
    }
    console.log(`✓ ${reservas.length} reservas creadas\n`);

    // ========== CREAR RESEÑAS (al menos 3 por destino) ==========
    console.log('⭐ Creando reseñas...');

    // Array de comentarios variados para reutilizar
    const comentariosPositivos = [
      '¡Experiencia inolvidable! Superó todas mis expectativas. Totalmente recomendado.',
      'Destino increíble, paisajes espectaculares y gente muy amable. Volveré sin dudas.',
      'Una de las mejores experiencias de viaje que he tenido. Todo fue perfecto.',
      'Simplemente espectacular. La organización fue impecable y los lugares hermosos.',
      'Maravilloso viaje, cada momento fue especial. Lo recomiendo al 100%.',
      'Destino de ensueño. Las fotos no le hacen justicia a la belleza real del lugar.',
      'Excelente experiencia, guías profesionales y lugares increíbles. Vale totalmente la pena.',
      'Un viaje que recordaré toda mi vida. Cada detalle fue cuidado con esmero.',
      'Impresionante destino con una cultura fascinante y paisajes únicos.',
      'Perfecta combinación de aventura y relajación. Muy satisfecho con todo.',
    ];

    const reseñasData = [];

    // Crear 3-4 reseñas por cada destino
    destinos.forEach((destino, index) => {
      const numReseñas = 3 + Math.floor(Math.random() * 2); // 3 o 4 reseñas por destino

      for (let i = 0; i < numReseñas; i++) {
        const usuarioIndex = ((index * numReseñas + i) % (usuarios.length - 1)) + 1; // Evitar admin
        const calificacion = Math.random() > 0.3 ? 5 : 4; // 70% son 5 estrellas, 30% son 4 estrellas
        const comentarioIndex = (index + i) % comentariosPositivos.length;

        reseñasData.push({
          usuario: usuarios[usuarioIndex]._id,
          destino: destino._id,
          calificacion: calificacion,
          comentario: comentariosPositivos[comentarioIndex],
          verificada: true,
        });
      }
    });

    const oldReseñasData = [];

    const reseñas = [];
    for (let reseñaData of reseñasData) {
      const reseña = new Reseña(reseñaData);
      await reseña.save();
      reseñas.push(reseña);
      const usuario = usuarios.find((u) => u._id.equals(reseña.usuario));
      const destino = destinos.find((d) => d._id.equals(reseña.destino));
      console.log(`  ✓ ${usuario.nombre} → ${destino.nombre} (${reseña.calificacion}⭐)`);
    }
    console.log(`✓ ${reseñas.length} reseñas creadas\n`);

    // ========== RESUMEN FINAL ==========
    console.log('\n' + '='.repeat(60));
    console.log('✅ ¡BASE DE DATOS POBLADA EXITOSAMENTE!');
    console.log('='.repeat(60));
    console.log(`\n📊 RESUMEN:`);
    console.log(`  👥 Usuarios: ${usuarios.length}`);
    console.log(`  🌍 Destinos: ${destinos.length}`);
    console.log(`  🔍 Indexados en Qdrant: ${indexadosExitosos}/${destinos.length}`);
    console.log(`  📅 Reservas: ${reservas.length}`);
    console.log(`  ⭐ Reseñas: ${reseñas.length}`);
    console.log(`\n🔐 CREDENCIALES DE ACCESO:`);
    console.log(`  Admin:  admin@viajar.com / admin123`);
    console.log(`  Users:  juan@example.com, maria@example.com, etc. / user123`);
    console.log(`\n💡 CARACTERÍSTICAS:`);
    console.log(`  • Cada destino tiene al menos 3 reseñas verificadas`);
    console.log(`  • Búsqueda semántica habilitada con embeddings de OpenAI`);
    console.log(`  • Base de datos vectorial Qdrant para búsquedas inteligentes`);
    console.log('\n' + '='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error poblando la base de datos:');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar el seed
seedDatabase();
