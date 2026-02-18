import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';



// Configuración del enlace HTTP para conectar con el servidor GraphQL
const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
});

// Configuración del contexto para propagar los headers
const authLink = setContext(async (_, { headers }) => {
    // Aquí puedes obtener el token de autenticación desde el almacenamiento local o cualquier otra fuente
    let token = '';

    try {
        // Determine the base URL
        let baseUrl = '';
        if (typeof window === 'undefined') {
            // Server-side: Use Vercel URL or fallback to localhost
            // Vercel sets VERCEL_URL (without https://)
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                baseUrl = process.env.URL || 'http://localhost:3000';
            }
        }
        // Client-side: use relative path (empty string)

        const api = await fetch(`${baseUrl}/api/gettoken`);
        if (api.ok) {
            const resp = await api.json();
            token = resp.token;
        }
    } catch (error) {
        console.error("Error obtaining token:", error);
    }
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