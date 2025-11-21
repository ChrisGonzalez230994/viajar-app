/**
 * Script para poblar la base de datos con datos de ejemplo
 * Ejecutar con: node api/seeds/seedDatabase.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Importar modelos
const User = require('../models/user.js');
const Destino = require('../models/destino.js');
const Reserva = require('../models/reserva.js');
const Reseña = require('../models/reseña.js');

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

// Datos de ejemplo - USUARIOS
const usuariosData = [
  {
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@viajar.com',
    nacionalidad: 'Argentina',
    fechaNacimiento: new Date('1990-01-01'),
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
    fechaNacimiento: new Date('1995-05-15'),
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
    fechaNacimiento: new Date('1992-08-20'),
    rol: 'user',
    confirmed: true,
  },
];

const destinosData = [
  {
    nombre: 'Cataratas del Iguazú',
    ciudad: 'Puerto Iguazú',
    pais: 'Argentina',
    descripcion:
      'Una de las maravillas naturales del mundo. Las Cataratas del Iguazú son un conjunto de cascadas espectaculares ubicadas en la frontera entre Argentina y Brasil. Con más de 275 saltos de agua, es un destino imperdible para los amantes de la naturaleza.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5',
    imagenes: [
      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5',
      'https://images.unsplash.com/photo-1580837119756-563d608dd119',
    ],
    precio: 150,
    ubicacion: {
      latitud: -25.6953,
      longitud: -54.4367,
      direccion: 'Parque Nacional Iguazú, Misiones',
    },
    actividades: [
      'Caminata por pasarelas',
      'Paseo en lancha',
      'Avistamiento de fauna',
      'Fotografía de naturaleza',
    ],
    disponibilidad: true,
    capacidadMaxima: 50,
  },
  {
    nombre: 'Machu Picchu',
    ciudad: 'Cusco',
    pais: 'Perú',
    descripcion:
      'Ciudad inca del siglo XV ubicada en lo alto de los Andes peruanos. Patrimonio de la Humanidad y una de las Siete Maravillas del Mundo Moderno. Un destino místico e histórico imprescindible.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1',
    imagenes: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377',
    ],
    precio: 280,
    ubicacion: {
      latitud: -13.1631,
      longitud: -72.545,
      direccion: 'Machu Picchu, Cusco',
    },
    actividades: ['Trekking', 'Visita guiada', 'Fotografía', 'Exploración arqueológica'],
    disponibilidad: true,
    capacidadMaxima: 30,
  },
  {
    nombre: 'Torres del Paine',
    ciudad: 'Puerto Natales',
    pais: 'Chile',
    descripcion:
      'Parque Nacional ubicado en la Patagonia chilena, conocido por sus imponentes montañas, glaciares azules, lagos turquesa y fauna silvestre. Un paraíso para los amantes del trekking y la aventura.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1601980861364-9f01d6de6c97',
    imagenes: ['https://images.unsplash.com/photo-1601980861364-9f01d6de6c97'],
    precio: 200,
    ubicacion: {
      latitud: -50.9423,
      longitud: -73.4068,
      direccion: 'Parque Nacional Torres del Paine, Magallanes',
    },
    actividades: ['Trekking', 'Camping', 'Avistamiento de fauna', 'Fotografía de paisajes'],
    disponibilidad: true,
    capacidadMaxima: 40,
  },
  {
    nombre: 'Cartagena de Indias',
    ciudad: 'Cartagena',
    pais: 'Colombia',
    descripcion:
      'Ciudad colonial en la costa caribeña de Colombia, famosa por sus murallas históricas, calles empedradas, arquitectura colorida y playas paradisíacas. Un destino perfecto para historia y playa.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d',
    imagenes: ['https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d'],
    precio: 120,
    ubicacion: {
      latitud: 10.391,
      longitud: -75.4794,
      direccion: 'Centro Histórico, Cartagena de Indias',
    },
    actividades: ['Tour histórico', 'Playa', 'Gastronomía', 'Vida nocturna'],
    disponibilidad: true,
    capacidadMaxima: 60,
  },
  {
    nombre: 'Salar de Uyuni',
    ciudad: 'Uyuni',
    pais: 'Bolivia',
    descripcion:
      'El salar más grande del mundo con más de 10,000 km². Durante la temporada de lluvias se convierte en un espejo gigante que refleja el cielo, creando paisajes surrealistas únicos en el planeta.',
    imagenPrincipal: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5',
    imagenes: ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5'],
    precio: 180,
    ubicacion: {
      latitud: -20.308,
      longitud: -66.8252,
      direccion: 'Salar de Uyuni, Potosí',
    },
    actividades: ['Tour en 4x4', 'Fotografía', 'Visita isla de cactus', 'Observación de estrellas'],
    disponibilidad: true,
    capacidadMaxima: 25,
  },
];

async function seedDatabase() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(uri, options);
    console.log('✓ Conectado a MongoDB\n');

    // Limpiar base de datos
    console.log('Limpiando base de datos...');
    await User.deleteMany({});
    await Destino.deleteMany({});
    await Reserva.deleteMany({});
    await Reseña.deleteMany({});
    console.log('✓ Base de datos limpia\n');

    // Crear usuarios
    console.log('Creando usuarios...');
    const usuarios = [];
    for (let userData of usuariosData) {
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      const usuario = new User({
        ...userData,
        password: hashedPassword,
      });
      await usuario.save();
      usuarios.push(usuario);
      console.log(`  ✓ Usuario creado: ${usuario.username} (${usuario.email})`);
    }
    console.log(`✓ ${usuarios.length} usuarios creados\n`);

    // Crear destinos
    console.log('Creando destinos...');
    const destinos = [];
    for (let destinoData of destinosData) {
      const destino = new Destino(destinoData);
      await destino.save();
      destinos.push(destino);
      console.log(`  ✓ Destino creado: ${destino.nombre}, ${destino.ciudad}`);
    }
    console.log(`✓ ${destinos.length} destinos creados\n`);

    // Crear algunas reservas de ejemplo
    console.log('Creando reservas de ejemplo...');
    const reservas = [];

    // Usuario regular hace reserva
    const reserva1 = new Reserva({
      usuario: usuarios[1]._id, // Juan
      destino: destinos[0]._id, // Cataratas
      fechaInicio: new Date('2025-11-15'),
      fechaFin: new Date('2025-11-18'),
      numeroPersonas: 2,
      precioTotal: 900,
      estado: 'confirmada',
      fechaConfirmacion: new Date(),
    });
    await reserva1.save();
    reservas.push(reserva1);
    console.log(`  ✓ Reserva creada: ${usuarios[1].nombre} → ${destinos[0].nombre}`);

    const reserva2 = new Reserva({
      usuario: usuarios[2]._id, // María
      destino: destinos[1]._id, // Machu Picchu
      fechaInicio: new Date('2025-12-01'),
      fechaFin: new Date('2025-12-05'),
      numeroPersonas: 1,
      precioTotal: 1120,
      estado: 'pendiente',
    });
    await reserva2.save();
    reservas.push(reserva2);
    console.log(`  ✓ Reserva creada: ${usuarios[2].nombre} → ${destinos[1].nombre}`);

    console.log(`✓ ${reservas.length} reservas creadas\n`);

    // Crear reseñas de ejemplo
    console.log('Creando reseñas de ejemplo...');
    const reseñas = [];

    const reseña1 = new Reseña({
      usuario: usuarios[1]._id,
      destino: destinos[0]._id,
      calificacion: 5,
      comentario:
        '¡Increíble experiencia! Las cataratas son impresionantes, el tour estuvo muy bien organizado y los guías fueron excelentes. Totalmente recomendado para toda la familia.',
      reserva: reserva1._id,
      verificada: true,
    });
    await reseña1.save();
    reseñas.push(reseña1);
    console.log(`  ✓ Reseña creada para: ${destinos[0].nombre}`);

    const reseña2 = new Reseña({
      usuario: usuarios[2]._id,
      destino: destinos[2]._id,
      calificacion: 5,
      comentario:
        'Torres del Paine es simplemente mágico. Los paisajes son de otro mundo y la experiencia de trekking fue inolvidable. Eso sí, hay que estar preparado físicamente.',
      verificada: true,
    });
    await reseña2.save();
    reseñas.push(reseña2);
    console.log(`  ✓ Reseña creada para: ${destinos[2].nombre}`);

    const reseña3 = new Reseña({
      usuario: usuarios[1]._id,
      destino: destinos[3]._id,
      calificacion: 4,
      comentario:
        'Cartagena es hermosa, la ciudad amurallada tiene mucho encanto. La comida es deliciosa y la gente muy amable. Solo le resto una estrella por el calor extremo.',
      verificada: true,
    });
    await reseña3.save();
    reseñas.push(reseña3);
    console.log(`  ✓ Reseña creada para: ${destinos[3].nombre}`);

    console.log(`✓ ${reseñas.length} reseñas creadas\n`);

    // Resumen
    console.log('\n========================================');
    console.log('✓ Base de datos poblada exitosamente!');
    console.log('========================================');
    console.log(`\nUsuarios creados: ${usuarios.length}`);
    console.log('  - admin@viajar.com (admin/admin123)');
    console.log('  - juan@example.com (juanperez/user123)');
    console.log('  - maria@example.com (mariagonzalez/user123)');
    console.log(`\nDestinos creados: ${destinos.length}`);
    console.log(`Reservas creadas: ${reservas.length}`);
    console.log(`Reseñas creadas: ${reseñas.length}`);
    console.log('\n========================================\n');
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar el seed
seedDatabase();
