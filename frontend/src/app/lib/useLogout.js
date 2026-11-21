'use client'
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import { endSession } from '@/app/lib/clientSession';

// Cierra la sesión: borra la cookie httpOnly en el servidor y limpia la caché de Apollo
export function useLogout() {
  const router = useRouter();
  const client = useApolloClient();

  return useCallback(async () => {
    try {
      await endSession();
    } finally {
      await client.clearStore();
      router.replace('/login');
      router.refresh();
    }
  }, [client, router]);
}
