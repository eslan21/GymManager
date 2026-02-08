
"use client";

import { ApolloProvider } from "@apollo/client";
import client from "./db";

export default function ApolloClientProvider({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}