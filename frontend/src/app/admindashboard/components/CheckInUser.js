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
  const [message, setMassage] = useState(null)
//query para confirmar qr
  const [findQRByAdmin, {loading, error}] = useLazyQuery(GET_QR);
  //Mutateion para crear el attendance
  const [checkIn] = useMutation(CHECK_IN)
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const { data:data1 } = await findQRByAdmin({
      variables: { id: codigo }
    });

    if (data1?.findQRByAdmin) {
      try {
        const {data:data2} = await checkIn({
        variables : {
          userId:data1?.findQRByAdmin?.user.id
        }
      });
      console.log(data2)

        Swal.fire({
          title: "Checking completado",
          icon: "success",
          draggable: true
        });
      } catch (error) {
        setMassage(error.message)
        setTimeout(() => {
          setMassage(null)
          
        }, 3000);
      }
      
      
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  // Mostrar resultado cuando data esté disponible
  

  return (
    <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-auto">
      <h2 className="text-white text-2xl font-bold text-center mb-4">
        Check-in
      </h2>
      <p className="text-gray-400 text-center mb-6">
        Ingresa código de Usuario.
      </p>
      
      <input
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Ingresa el código"
        className="w-full bg-slate-700 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
      />
      
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading}
        className={`${loading ? 'opacity-50 cursor-not-allowed' : ''} w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mt-4`}
      >
        {loading ? 'Cargando...' : 'Confirmar Check-in'}
      </button>

      {message && (
        <p className="text-red-500 text-center mt-4">
          Error: {message}
        </p>
      )}
    </div>
  );
}

export default CheckinUser;