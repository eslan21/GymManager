'use client'
import { useState } from "react";
import { useLazyQuery, gql, useMutation } from "@apollo/client";
import Swal from 'sweetalert2';

const CHECK_IN = gql`
mutation checkIn($userId: ID!) {
  checkIn(userId: $userId) {
    id
    user {
      fullName
    }
    checkIn
  }
}
`;

const CHECK_OUT = gql`
mutation checkout($userId: ID!) {
  checkout(userId: $userId) {
    id
    user {
      fullName
    }
    checkOut
  }
}
`;

const GET_QR = gql`
query findQRByAdmin($id:ID!){
  findQRByAdmin(id: $id){
     user {
     id
      fullName
      isActive
     }
     createdAt
     expiresAt
  }
}
`;

function CheckinUser() {
  const [codigo, setCodigo] = useState('');
  const [message, setMassage] = useState(null);
  const [mode, setMode] = useState('checkin'); // 'checkin' | 'checkout'

  //query para confirmar qr
  const [findQRByAdmin, { loading: loadingQR }] = useLazyQuery(GET_QR);
  //Mutateion para crear el attendance
  const [checkIn, { loading: loadingCheckIn }] = useMutation(CHECK_IN);
  const [checkout, { loading: loadingCheckOut }] = useMutation(CHECK_OUT);

  const loading = loadingQR || loadingCheckIn || loadingCheckOut;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMassage(null);

    try {
      const { data: data1 } = await findQRByAdmin({
        variables: { id: codigo }
      });

      if (data1?.findQRByAdmin) {
        const userId = data1.findQRByAdmin.user.id;
        const userName = data1.findQRByAdmin.user.fullName;

        try {
          if (mode === 'checkin') {
            await checkIn({
              variables: { userId }
            });

            Swal.fire({
              title: `¡Bienvenido/a ${userName}!`,
              text: "Tu entrada ha sido registrada.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            await checkout({
              variables: { userId }
            });

            Swal.fire({
              title: `¡Hasta luego ${userName}!`,
              text: "Tu salida ha sido registrada.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
          }
          setCodigo(''); // Limpiar input
        } catch (error) {
          let errorMessage = error.message;
          let icon = 'error';

          if (errorMessage.includes('ya está dentro')) {
            icon = 'warning';
          } else if (errorMessage.includes('membresía ha vencido')) {
            icon = 'error';
            errorMessage = '¡La membresía ha vencido! El usuario no puede ingresar.';
          }

          Swal.fire({
            icon: icon,
            title: icon === 'warning' ? '¡Atención!' : 'Error',
            text: errorMessage,
          });
        }

      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el usuario o código inválido',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Mode Toggle Switch */}
      <div className="flex bg-slate-700/50 p-1 rounded-lg mb-6 relative z-10">
        <button
          onClick={() => { setMode('checkin'); setMassage(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${mode === 'checkin'
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Entrada (Check-In)
        </button>
        <button
          onClick={() => { setMode('checkout'); setMassage(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${mode === 'checkout'
            ? 'bg-red-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Salida (Check-Out)
        </button>
      </div>

      <h2 className="text-white text-2xl font-bold text-center mb-2">
        {mode === 'checkin' ? 'Registrar Entrada' : 'Registrar Salida'}
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        {mode === 'checkin'
          ? 'Ingresa el código para dar acceso al usuario.'
          : 'Ingresa el código para registrar la salida.'}
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ingresa el código de usuario..."
          className={`w-full bg-slate-700 text-white placeholder-gray-500 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all mb-4
            ${mode === 'checkin'
              ? 'border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/50'
              : 'border-slate-600 focus:border-red-500 focus:ring-red-500/50'}`
          }
          autoFocus
        />

        <button
          type="submit"
          disabled={loading || !codigo}
          className={`w-full font-semibold py-3 rounded-lg transition-colors duration-200 
            ${loading || !codigo ? 'opacity-50 cursor-not-allowed bg-gray-600' : ''}
            ${!loading && codigo && mode === 'checkin' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
            ${!loading && codigo && mode === 'checkout' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          `}
        >
          {loading
            ? 'Procesando...'
            : (mode === 'checkin' ? 'Confirmar Entrada' : 'Confirmar Salida')
          }
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium animate-pulse ${message.includes('Error') || message.includes('No') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
          }`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default CheckinUser;