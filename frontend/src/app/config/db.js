import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';



// Configuración del enlace HTTP para conectar con el servidor GraphQL
const httpLink = createHttpLink({
    uri: 'http://localhost:4000', // Endpoint GraphQL en localhost
});

// Configuración del contexto para propagar los headers
const authLink =  setContext(async (_, { headers }) => {
    // Aquí puedes obtener el token de autenticación desde el almacenamiento local o cualquier otra fuente
    const url = process.env.URL || 'http://localhost:3000'
    const api = await fetch(url + '/api/gettoken')
    const resp = await api.json()
    let token = resp.token
   
 

    
   
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

// Configuración del cliente Apollo
const client = new ApolloClient({
    link: authLink.concat(httpLink), // Combina authLink con httpLink
    cache: new InMemoryCache(), // Configuración de caché
});

export default client;