const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Define el esquema para los registros de asistencia en la base de datos.
 */
const AttendanceSchema = new Schema({
    /**
     * Campo que establece la relación con el modelo User.
     * Almacena el ObjectId del usuario. El 'ref' es crucial para que .populate() funcione.
     */
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // IMPORTANTE: Este nombre debe ser el mismo que usaste al definir tu modelo de usuario (ej. mongoose.model('User', ...))
        required: true
    },

    /**
     * Fecha y hora en que el usuario realizó el check-in.
     * Se establece automáticamente al crear el documento.
     */
    checkIn: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkOut: {
        type: Date,
        default: null
    }


}, {
    // Esta opción agrega automáticamente los campos `createdAt` y `updatedAt`
    timestamps: true
});

// Exporta el modelo para poder usarlo en los resolvers.
module.exports = mongoose.model('Attendance', AttendanceSchema);