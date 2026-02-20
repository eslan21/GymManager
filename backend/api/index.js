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
    introspection: true,
});

const startServer = server.start();

module.exports = async (req, res) => {
    await connectDB();

    // Configuración de CORS
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'GET' && req.url === '/') {
        res.setHeader('Content-Type', 'text/plain');
        res.end('GymManager Backend is running!');
        return;
    }

    if (req.method === 'OPTIONS') {
        res.end();
        return false;
    }

    await startServer;

    // Configurar el path de Apollo Server dinámicamente según la petición que llegue
    const requestPath = req.url ? req.url.split('?')[0] : '/';
    await server.createHandler({ path: requestPath })(req, res);
};

// Configuración de micro para no parsear el body (Apollo lo maneja)
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
