const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reseñaSchema = new Schema(
  {
    usuario: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, "El usuario es requerido"] 
    },
    destino: { 
      type: Schema.Types.ObjectId, 
      ref: 'Destino', 
      required: [true, "El destino es requerido"] 
    },
    calificacion: { 
      type: Number, 
      required: [true, "La calificación es requerida"],
      min: [1, "La calificación mínima es 1"],
      max: [5, "La calificación máxima es 5"]
    },
    comentario: { 
      type: String, 
      required: [true, "El comentario es requerido"],
      minlength: [10, "El comentario debe tener al menos 10 caracteres"],
      maxlength: [1000, "El comentario no puede exceder 1000 caracteres"]
    },
    imagenes: [{ 
      type: String // URLs de imágenes que el usuario puede subir
    }],
    reserva: { 
      type: Schema.Types.ObjectId, 
      ref: 'Reserva' // Referencia a la reserva relacionada (opcional)
    },
    verificada: { 
      type: Boolean, 
      default: false // Si el admin verificó que es una reseña real
    },
    likes: { 
      type: Number, 
      default: 0 
    },
    reportada: { 
      type: Boolean, 
      default: false 
    },
    motivoReporte: { 
      type: String 
    }
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índice compuesto para evitar reseñas duplicadas del mismo usuario al mismo destino
reseñaSchema.index({ usuario: 1, destino: 1 });
reseñaSchema.index({ destino: 1, createdAt: -1 });
reseñaSchema.index({ calificacion: -1 });

// Método para actualizar la calificación promedio del destino
reseñaSchema.post('save', async function() {
  const Destino = mongoose.model('Destino');
  const Reseña = mongoose.model('Reseña');
  
  try {
    const reseñas = await Reseña.find({ destino: this.destino });
    const total = reseñas.length;
    const suma = reseñas.reduce((acc, r) => acc + r.calificacion, 0);
    const promedio = total > 0 ? suma / total : 0;
    
    await Destino.findByIdAndUpdate(this.destino, {
      calificacionPromedio: promedio,
      totalReseñas: total
    });
  } catch (error) {
    console.error('Error actualizando calificación del destino:', error);
  }
});

// Actualizar también al eliminar una reseña
reseñaSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Destino = mongoose.model('Destino');
    const Reseña = mongoose.model('Reseña');
    
    try {
      const reseñas = await Reseña.find({ destino: doc.destino });
      const total = reseñas.length;
      const suma = reseñas.reduce((acc, r) => acc + r.calificacion, 0);
      const promedio = total > 0 ? suma / total : 0;
      
      await Destino.findByIdAndUpdate(doc.destino, {
        calificacionPromedio: promedio,
        totalReseñas: total
      });
    } catch (error) {
      console.error('Error actualizando calificación del destino:', error);
    }
  }
});

// Convert to model
const Reseña = mongoose.model("Reseña", reseñaSchema);

module.exports = Reseña;
