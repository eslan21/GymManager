// Guarda el JWT del backend en una cookie httpOnly (vía /api/auth) y redirige según el rol.
export async function startSession(token, router) {
  const response = await fetch('/api/auth', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('No se pudo iniciar la sesión. Inténtalo de nuevo.');
  }

  const { dataToken } = await response.json();

  if (dataToken.role === "CLIENTE") router.push('/userdashboard')
  else if (dataToken.role === "ADMIN") router.push('/admindashboard')
  else {
    await endSession();
    throw new Error('Tu rol no tiene un panel disponible todavía.');
  }
}

// Elimina la cookie de sesión en el servidor
export async function endSession() {
  await fetch('/api/logout', { method: 'POST' });
}
