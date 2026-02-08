
'use client'
import '@/app/globals.css';
import ApolloClientProvider from '@/app/config/ApolloClientProvider'
import { AuthProvider } from '@/app/context/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ApolloClientProvider>
        <AuthProvider>
          <body>{children}</body>
        </AuthProvider>
      </ApolloClientProvider>
    </html>
  )
}
