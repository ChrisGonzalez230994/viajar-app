const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reservaSchema = new Schema(
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
    fechaInicio: { 
      type: Date, 
      required: [true, "La fecha de inicio es requerida"] 
    },
    fechaFin: { 
      type: Date, 
      required: [true, "La fecha de fin es requerida"] 
    },
    estado: { 
      type: String, 
      enum: ["pendiente", "confirmada", "cancelada", "completada"],
      default: "pendiente",
      required: true
    },
    numeroPersonas: { 
      type: Number, 
      required: [true, "El número de personas es requerido"],
      min: [1, "Debe haber al menos 1 persona"]
    },
    precioTotal: { 
      type: Number, 
      required: [true, "El precio total es requerido"],
      min: [0, "El precio no puede ser negativo"]
    },
    notas: { 
      type: String // Notas adicionales del usuario
    },
    motivoCancelacion: { 
      type: String // En caso de cancelación
    },
    fechaCancelacion: { 
      type: Date 
    },
    fechaConfirmacion: { 
      type: Date 
    }
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Validación personalizada: fecha fin debe ser posterior a fecha inicio
reservaSchema.pre('save', function(next) {
  if (this.fechaFin <= this.fechaInicio) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  } else {
    next();
  }
});

// Índices para mejorar las búsquedas
reservaSchema.index({ usuario: 1, createdAt: -1 });
reservaSchema.index({ destino: 1, fechaInicio: 1, fechaFin: 1 });
reservaSchema.index({ estado: 1 });

// Convert to model
const Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = Reserva;
