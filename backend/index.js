const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken')    //Importamos JWT
const getUser = require('./lib/auth');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const connectDB = require('./config/db');


//conectando a BD 

connectDB();



const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Obtener el token de los headers
    const token = req.headers['authorization'] || '';

    const user = getUser(token);

    // Retornar el usuario en el contexto
    return { user };
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Servidor listo en ${url}`);
});
