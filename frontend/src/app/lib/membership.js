const DAY_MS = 24 * 60 * 60 * 1000;

// Debe coincidir con MEMBERSHIP_DAYS del backend
export const MEMBERSHIP_DAYS = 30;

const dateFormatter = new Intl.DateTimeFormat('es', { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Calcula el estado de la membresía a partir de la fecha ISO que devuelve el backend.
 * @param {{ membershipExpiresAt?: string|null, isActive?: boolean }} user
 */
export function getMembershipInfo(user) {
  const expiresAt = user?.membershipExpiresAt ? new Date(user.membershipExpiresAt) : null;
  const valid = expiresAt && !Number.isNaN(expiresAt.getTime());

  if (!valid) {
    return { expiresAt: null, label: 'Sin fecha', daysRemaining: null, isExpired: !user?.isActive, isActive: Boolean(user?.isActive) };
  }

  const diff = expiresAt.getTime() - Date.now();
  const isExpired = diff <= 0;
  return {
    expiresAt,
    label: dateFormatter.format(expiresAt),
    daysRemaining: isExpired ? 0 : Math.ceil(diff / DAY_MS),
    isExpired,
    isActive: Boolean(user?.isActive) && !isExpired,
  };
}
