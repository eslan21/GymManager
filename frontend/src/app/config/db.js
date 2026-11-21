import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Todas las peticiones pasan por el proxy /api/graphql (mismo origen).
// El proxy adjunta el JWT desde la cookie httpOnly, así el token nunca se expone al JavaScript del navegador.
// En SSR (sin ventana) no hay cookie del usuario, por lo que se consulta el backend directamente.
const httpLink = new HttpLink({
    uri: () =>
        typeof window === 'undefined'
            ? (process.env.BACKEND_URI || process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:4000')
            : '/api/graphql',
    credentials: 'same-origin',
});

// Configuración del cliente Apollo
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default client;
