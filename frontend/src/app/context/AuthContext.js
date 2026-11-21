// ARCHIVO: context/AuthContext.js
'use client'
import React, { createContext, useState } from 'react';




// 1. Crear el contexto
export const  AuthContext = createContext(null);

// 2. Crear el Proveedor del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = no logueado, {objeto de usuario} = logueado
  
  const [searchInput, setSearchInput] = useState('');

  const value = {
    user,
    setUser,
    searchInput,
    setSearchInput

  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


