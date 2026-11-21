'use client'
import Script from 'next/script';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, gql } from '@apollo/client';
import { startSession } from '@/app/lib/clientSession';

const LOGIN_WITH_GOOGLE = gql`
mutation loginWithGoogle($idToken: String!){
  loginWithGoogle(idToken: $idToken){
    token
    usuario {
      fullName
      email
      role
      isActive
    }
  }
}
`;

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton({ onError }) {
  const router = useRouter();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);

  // Callback de Google: recibe el ID token (credential) y lo intercambia por nuestro JWT
  const handleCredential = async ({ credential }) => {
    setLoading(true);
    try {
      const { data } = await loginWithGoogle({ variables: { idToken: credential } });
      const token = data?.loginWithGoogle?.token;
      if (!token) throw new Error('No se recibió un token.');
      await startSession(token, router);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      onError?.(error.message);
      setLoading(false);
    }
  };

  // onReady se ejecuta al cargar el script y en cada montaje posterior
  const initGoogle = () => {
    if (!window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      locale: 'es',
      width: buttonRef.current.offsetWidth || 320,
    });
  };

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initGoogle}
      />
      <div className="relative w-full flex justify-center">
        <div ref={buttonRef} className={`w-full flex justify-center ${loading ? 'opacity-50 pointer-events-none' : ''}`} />
        {loading ? (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
            Iniciando sesión con Google...
          </span>
        ) : null}
      </div>
    </>
  );
}
