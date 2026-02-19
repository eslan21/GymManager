const { ApolloServer } = require('apollo-server-micro');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const typeDefs = require('../db/schema');
const resolvers = require('../db/resolvers');
const getUser = require('../lib/auth');

// Conexión a BD con caché para evitar múltiples conexiones en serverless
let isConnected;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log('Database connected');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['authorization'] || '';
        const user = getUser(token);
        return { user };
    },
    introspection: true, // Habilitar playground en producción si se desea
    playground: true,
});

const startServer = server.start();

module.exports = async (req, res) => {
    await connectDB();
    await startServer;
    await server.createHandler({ path: '/api' })(req, res);
};

// Configuración de micro para no parsear el body (Apollo lo maneja)
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
