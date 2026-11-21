const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Para evitar duplicados
    lowercase: true,
    trim: true
  },
  // Los usuarios que se registran con Google no tienen contraseña ni fecha de nacimiento
  password: {
    type: String,
    required: function () { return !this.googleId; },
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Permite muchos documentos sin googleId
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  birth: {
    type: String,
    required: function () { return !this.googleId; },
    default: null
  },
  role: {
    type: String,
    required: true,
    enum: ["ADMIN", "ENTRENADOR", "CLIENTE"] // Puedes ajustar según tu lógica
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false
  },
  membershipExpiresAt: {
    type: Date,
    default: null
  },

}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('User', userSchema);
