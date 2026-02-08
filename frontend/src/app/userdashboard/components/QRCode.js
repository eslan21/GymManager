'use client'
import { useState } from "react"
import { gql, useMutation, useQuery } from "@apollo/client"
import QRCode from 'qrcode'

const GENERANDO_QR = gql`
mutation qrGenerator{
    qrGenerator{
      id
      user {
        email
        fullName
      }
    }
}
`
const GET_QR = gql`
query findQR{
  findQR{
    id
    user{
      fullName
    }
    expiresAt
  }
}
`;


export default function QRCodeFunction() {
  // qrState
  const [message, setMessage] = useState(null)
  const [qrRUL, setQRUrl] = useState(null)
  const [qrId, setQRId] = useState(null)

  //creamos el Mutation 

  const [qrGenerator] = useMutation(GENERANDO_QR);
  const { data: dataGetQR, loading, error } = useQuery(GET_QR)

  //Crear query para los QR


  //Funcion Genera y guarda el QR
  const generateQR = async () => {
    try {

      let qrImg;
      if (dataGetQR?.findQR?.id) {
        qrImg = await QRCode.toDataURL(dataGetQR?.findQR.id)
        await setQRUrl(qrImg)
        await setQRId(dataGetQR?.findQR?.id.slice(-5))

      } else {

        const { data } = await qrGenerator()
        qrImg = await QRCode.toDataURL(data.qrGenerator.id)
        await setQRUrl(qrImg)
        await setQRId(data?.qrGenerator?.id.slice(-5))
      }




    } catch (error) {


      console.error(error)
      setMessage(error.message)
      setTimeout(() => {
        setMessage(null)
      }, 2000);
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-full flex flex-col items-center text-center justify-center">
      <h2 className="text-xl font-bold text-white mb-4">Acceso con QR</h2>
      <p className="text-gray-400 mb-6">Muestra tu código en recepción para ingresar.</p>
      {message && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Atención</p>
          <p>{message}</p>
        </div>
      )}
      {qrRUL && (
        <>
          <img
            src={qrRUL}
            alt="Código QR"
            className="w-40 h-40 mb-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-md"
          />
          <p className="text-gray-400 dark:text-gray-500 text-center text-sm font-medium mb-4">{qrId}</p>
        </>

      )}
      <button
        className={`bg-indigo-600 hover:bg-indigo-700
                       text-white font-bold py-3 px-6 rounded-lg 
                       transition-colors duration-300 ${qrRUL ? "opacity-50 pointer-events-none bg-gray-400" : ""}`}
        onClick={() => generateQR()}
      >
        Mostrar mi QR
      </button>
    </div>
  )
}
