'use client'
import { CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function MembershipStatus({ user }) {
    if (!user) return null;

    const { membershipExpiresAt, isActive } = user;

    // Calcular estado
    let isExpired = false;
    let daysRemaining = 0;

    if (membershipExpiresAt) {
        const expirationDate = new Date(parseInt(membershipExpiresAt));
        const now = new Date();
        const diffTime = expirationDate - now;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpired = diffTime < 0;
    } else {
        // Si no tiene fecha, asumimos que depende solo de isActive o es nuevo
        if (!isActive) isExpired = true;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(parseInt(dateString));
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <CalendarIcon className="h-6 w-6 mr-2 text-indigo-400" />
                    Estado de Membresía
                </h2>

                <div className="flex items-center justify-between mb-6">
                    <div className="text-gray-300">Estado</div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isActive && !isExpired
                            ? 'bg-green-900/50 text-green-400 border border-green-700'
                            : 'bg-red-900/50 text-red-400 border border-red-700'
                        }`}>
                        {isActive && !isExpired ? (
                            <>
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Activa
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                Inactiva / Vencida
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Vence el:</div>
                        <div className="text-lg font-medium text-white">
                            {formatDate(membershipExpiresAt)}
                        </div>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Días Restantes:</div>
                        <div className={`text-2xl font-bold ${daysRemaining < 3 ? 'text-red-400' : 'text-white'}`}>
                            {membershipExpiresAt ? (isExpired ? '0' : daysRemaining) : '-'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-500 text-center">
                    {isExpired
                        ? 'Tu membresía ha caducado. Por favor, acércate a recepción para renovarla.'
                        : '¡Sigue entrenando duro! 💪'
                    }
                </p>
            </div>
        </div>
    );
}
