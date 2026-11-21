const User = require('../model/User');

// Duración de la membresía al activar o renovar a un cliente
const MEMBERSHIP_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Solo los clientes tienen membresía con vencimiento
const MEMBERSHIP_ROLE = 'CLIENTE';

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const isMembershipExpired = (user, now = new Date()) =>
  Boolean(user.membershipExpiresAt) && new Date(user.membershipExpiresAt) < now;

/**
 * Nueva fecha de vencimiento al renovar: si la membresía sigue vigente se suman
 * los días al vencimiento actual (no se pierden días); si no, se cuenta desde hoy.
 */
const nextExpiration = (user, now = new Date()) => {
  const current = user.membershipExpiresAt ? new Date(user.membershipExpiresAt) : null;
  const base = current && current > now ? current : now;
  return addDays(base, MEMBERSHIP_DAYS);
};

// Desactiva a los clientes cuya membresía ya venció
const deactivateExpiredMemberships = async () => {
  await User.updateMany(
    {
      role: MEMBERSHIP_ROLE,
      isActive: true,
      membershipExpiresAt: { $ne: null, $lt: new Date() },
    },
    { $set: { isActive: false } }
  );
};

module.exports = {
  MEMBERSHIP_DAYS,
  MEMBERSHIP_ROLE,
  addDays,
  isMembershipExpired,
  nextExpiration,
  deactivateExpiredMemberships,
};
