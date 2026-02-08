'use client';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import Swal from 'sweetalert2';

const GET_DAILY_ATTENDANCE = gql`
  query getDailyAttendance {
    getDailyAttendance {
      id
      checkIn
      checkOut
      user {
        id
        fullName
        email
        phone
      }
    }
  }
`;

const CHECKOUT_USER = gql`
  mutation checkout($userId: ID!) {
    checkout(userId: $userId) {
      id
      checkOut
    }
  }
`;

export default function AttendanceTable() {
    const { data, loading, error, refetch } = useQuery(GET_DAILY_ATTENDANCE, {
        pollInterval: 5000, // Actualizar cada 5 segundos
    });

    const [checkout] = useMutation(CHECKOUT_USER);
    const [viewMode, setViewMode] = useState('current'); // 'current' | 'all'

    if (loading) return <div className="text-white p-4">Cargando asistencia...</div>;
    if (error) return <div className="text-red-500 p-4">Error al cargar datos: {error.message}</div>;

    const allAttendance = data?.getDailyAttendance || [];

    // Filtrar usuarios que están actualmente en el gimnasio (tienen checkIn pero NO checkOut)
    const currentUsers = allAttendance.filter(record => !record.checkOut);

    const handleCheckout = async (userId, userName) => {
        try {
            const result = await Swal.fire({
                title: '¿Registrar Salida?',
                text: `¿Estás seguro de registrar la salida de ${userName}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, registrar salida'
            });

            if (result.isConfirmed) {
                await checkout({
                    variables: { userId }
                });

                await refetch();

                Swal.fire(
                    '¡Salida Registrada!',
                    `La salida de ${userName} ha sido registrada.`,
                    'success'
                );
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const recordsToShow = viewMode === 'current' ? currentUsers : allAttendance;

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {viewMode === 'current' ? 'Usuarios en el Gimnasio' : 'Historial del Día'}
                    </h2>
                    <p className="text-gray-400">
                        {viewMode === 'current'
                            ? `Hay ${currentUsers.length} personas entrenando ahora.`
                            : `Total de ${allAttendance.length} ingresos hoy.`
                        }
                    </p>
                </div>

                <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('current')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'current'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        En Gimnasio
                    </button>
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'all'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Historial Hoy
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Hora Entrada</th>
                            <th className="px-6 py-3">Hora Salida</th>
                            <th className="px-6 py-3">Estado</th>
                            {viewMode === 'current' && <th className="px-6 py-3 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {recordsToShow.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No hay registros para mostrar en esta vista.
                                </td>
                            </tr>
                        ) : (
                            recordsToShow.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-750 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg mr-3">
                                                {record.user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{record.user.fullName}</div>
                                                <div className="text-sm text-gray-500">{record.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {new Date(parseInt(record.checkIn)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {record.checkOut
                                            ? new Date(parseInt(record.checkOut)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.checkOut
                                                ? 'bg-gray-700 text-gray-300'
                                                : 'bg-green-900 text-green-300 border border-green-700'
                                            }`}>
                                            {record.checkOut ? 'Finalizado' : 'Entrenando'}
                                        </span>
                                    </td>
                                    {viewMode === 'current' && (
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleCheckout(record.user.id, record.user.fullName)}
                                                className="text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1 rounded-md text-sm transition-colors border border-red-900/50"
                                            >
                                                Registrar Salida
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
