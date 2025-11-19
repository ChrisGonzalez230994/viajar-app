const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: [true, 'Username es requerido'], unique: true },
    password: { type: String, required: [true, 'Contraseña es requerida'] },
    nombre: { type: String, required: [true, 'Nombre es requerido'] },
    apellido: { type: String, required: [true, 'Apellido es requerido'] },
    email: { type: String, required: [true, 'Email es requerido'], unique: true },
    ciudad: { type: String },
    nacionalidad: { type: String },
    identificacion: { type: String },
    fechaNacimiento: { type: Date },
    rol: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
    confirmed: { type: Boolean, default: false },

    // Campos adicionales útiles
    phone: { type: String },

    // Campo para manejar cambios de email pendientes
    pendingEmailChange: {
      newEmail: { type: String },
      token: { type: String },
      requestedAt: { type: Date },
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

//Validator
userSchema.plugin(uniqueValidator, { message: 'Error, email already exists.' });

// convert to model
const User = mongoose.model('User', userSchema);

module.exports = User;
