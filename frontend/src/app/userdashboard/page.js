'use client';
import { useQuery, gql } from '@apollo/client';
import QRCode from "./components/QRCode";
import MembershipStatus from "./components/MembershipStatus";

// Query para obtener datos del usuario
const GET_ME = gql`
  query getMe {
    getMe {
      isActive
      membershipExpiresAt
      fullName
    }
  }
`;

export default function Dashboard() {
  const { data, loading, error } = useQuery(GET_ME);

  // Si está cargando, podemos mostrar un esqueleto o texto simple
  // Pero como QRCode también hace sus propias queries, podemos renderizarlo
  // y pasar undefined a MembershipStatus hasta que cargue.

  // NOTA: QRCode.js hace su propia query (findQR). 

  const userData = data?.getMe;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Mi Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Tarjeta para Mostrar QR */}
        <div className="w-full">
          <QRCode />
        </div>

        {/* Tarjeta para Estado de Membresía */}
        <div className="w-full">
          {loading ? (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-full flex items-center justify-center text-gray-400">
              Cargando información...
            </div>
          ) : (
            <MembershipStatus user={userData} />
          )}
        </div>
      </div>
    </div>
  );
}
