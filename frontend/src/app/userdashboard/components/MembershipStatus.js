'use client'
import { CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { getMembershipInfo, MEMBERSHIP_DAYS } from '@/app/lib/membership';

export default function MembershipStatus({ user }) {

    if (!user) return null;

    const { label, daysRemaining, isActive, expiresAt } = getMembershipInfo(user);

    // Mensaje según el estado
    let footer = '¡Sigue entrenando duro! 💪';
    if (!isActive && !expiresAt) {
        footer = `Tu cuenta está pendiente de activación. Al activarla tendrás ${MEMBERSHIP_DAYS} días de membresía.`;
    } else if (!isActive) {
        footer = 'Tu membresía ha caducado. Por favor, acércate a recepción para renovarla.';
    } else if (daysRemaining <= 3) {
        footer = 'Tu membresía vence pronto. Acércate a recepción para renovarla.';
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <CalendarIcon className="h-6 w-6 mr-2 text-indigo-400" />
                    Estado de Membresía
                </h2>

                <div className="flex items-center justify-between mb-6">
                    <div className="text-gray-300">Estado</div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isActive
                        ? 'bg-green-900/50 text-green-400 border border-green-700'
                        : 'bg-red-900/50 text-red-400 border border-red-700'
                        }`}>
                        {isActive ? (
                            <>
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Activa
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                {expiresAt ? 'Vencida' : 'Inactiva'}
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Vence el:</div>
                        <div className="text-lg font-medium text-white">
                            {label}
                        </div>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Días Restantes:</div>
                        <div className={`text-2xl font-bold ${daysRemaining !== null && daysRemaining <= 3 ? 'text-red-400' : 'text-white'}`}>
                            {daysRemaining ?? '-'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-500 text-center">
                    {footer}
                </p>
            </div>
        </div>
    );
}
