const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken')    //Importamos JWT
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
    
    // Aquí podrías agregar lógica para verificar y decodificar el token
    // Por ejemplo, usando una librería como jsonwebtoken
    let user = null;
    if (token) {
      try {
        const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        user = decodedToken;
      } catch (error) {
        console.error('Error al verificar el token:', error);
      }
    }

    // Retornar el usuario en el contexto
    return { user };
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Servidor listo en ${url}`);
});
