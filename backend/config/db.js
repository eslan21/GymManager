const mongoose = require('mongoose');
require('dotenv').config();

const conectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI, {

        });
        console.log('Conectado a la BD');
    } catch (error) {
        console.log('hubo un error');
        console.log(error)
        process.exit(1); //detiene app
    }
}

module.exports = conectDB;