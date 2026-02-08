const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Nombre del modelo de usuario
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index para eliminar cuando expire
  }
});

module.exports = mongoose.model('QR', qrSchema);
