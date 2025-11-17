const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const destinoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del destino es requerido'],
      trim: true,
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true,
    },
    pais: {
      type: String,
      required: [true, 'El país es requerido'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
    },
    imagenes: [
      {
        type: String, // URLs de las imágenes
      },
    ],
    imagenPrincipal: {
      type: String, // URL de la imagen principal
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    ubicacion: {
      latitud: { type: Number, required: true },
      longitud: { type: Number, required: true },
      direccion: { type: String },
    },
    actividades: [
      {
        type: String, // Lista de actividades disponibles
      },
    ],
    categorias: [
      {
        type: String, // Categorías del destino (aventura, cultura, etc.)
      },
    ],
    tipoViaje: [
      {
        type: String,
        enum: [
          'aventura',
          'romantico',
          'historia',
          'naturaleza',
          'familiar',
          'playa',
          'ciudad',
          'gastronomico',
          'relax',
          'fotografia',
        ],
      },
    ],
    disponibilidad: {
      type: Boolean,
      default: true,
    },
    calificacionPromedio: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReseñas: {
      type: Number,
      default: 0,
    },
    capacidadMaxima: {
      type: Number,
      default: 10,
    },
    destacado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índices para mejorar las búsquedas
destinoSchema.index({ nombre: 'text', ciudad: 'text', pais: 'text', descripcion: 'text' });
destinoSchema.index({ ciudad: 1, pais: 1 });
destinoSchema.index({ calificacionPromedio: -1 });

// Convert to model
const Destino = mongoose.model('Destino', destinoSchema);

module.exports = Destino;
